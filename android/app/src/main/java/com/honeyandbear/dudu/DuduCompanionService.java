package com.honeyandbear.dudu;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.os.SystemClock;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.WebSocket;
import okhttp3.WebSocketListener;

public class DuduCompanionService extends Service {
    private static final String TAG = "DuduCompanionService";
    public static final String CHANNEL_COMPANION_ID = "dudu_companion_channel";
    public static final String CHANNEL_CHAT_ID = "dudu_chat_channel";
    public static final String CHANNEL_MUSIC_ID = "dudu_music_channel";
    public static final int COMPANION_NOTIFICATION_ID = 9001;
    public static final int MUSIC_NOTIFICATION_ID = 9002;
    private static final java.util.Set<Integer> activeChatNotificationIds = java.util.Collections.synchronizedSet(new java.util.HashSet<>());

    private static final String PREFS_NAME = "dudu_companion_prefs";
    private static final String KEY_FOOD = "stat_food";
    private static final String KEY_SLEEP = "stat_sleep";
    private static final String KEY_UNREAD = "stat_unread";
    private static final String KEY_IDENTITY = "my_identity";
    private static final String KEY_PARTNER_LABEL = "partner_label";
    private static final String KEY_LAST_NOTIFIED_TS = "last_notified_ts";
    private static final String RELAY_AUTH_TOKEN = "415abdb5c1ff97e7de8c9f2c43be8ed4efba6f49ad912f301323212c27dacf5a";
    private static final String WS_URL = "wss://chat.nexora-v1.my.id/chat-socket?token=" + RELAY_AUTH_TOKEN;

    private static volatile boolean isAppForeground = false;
    private static volatile DuduCompanionService instance = null;
    private static volatile long lastHeadsUpTs = 0;

    private OkHttpClient httpClient;
    private WebSocket webSocket;
    private final AtomicBoolean isConnecting = new AtomicBoolean(false);
    private PowerManager.WakeLock wakeLock;
    private ScheduledExecutorService pingExecutor;

    public static void setAppForeground(boolean foreground) {
        isAppForeground = foreground;
    }

    public static boolean isAppForeground() {
        return isAppForeground;
    }

    public static void start(Context context) {
        if (context == null) return;
        try {
            Intent intent = new Intent(context, DuduCompanionService.class);
            context.startService(intent);
        } catch (Throwable t) {
            Log.w(TAG, "startService error: " + t.getMessage());
        }
    }

    public static void updateStats(Context context, int food, int sleep, int unread) {
        if (context == null) return;
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit()
                .putInt(KEY_FOOD, food)
                .putInt(KEY_SLEEP, sleep)
                .putInt(KEY_UNREAD, unread)
                .apply();
    }

    public static void setIdentity(Context context, String identity) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String idLower = (identity != null) ? identity.toLowerCase() : "dudu";
        boolean isDudu = idLower.contains("dudu") || idLower.contains("kevin");
        String partner = isDudu ? "Bubu" : "Dudu";
        prefs.edit()
                .putString(KEY_IDENTITY, idLower)
                .putString(KEY_PARTNER_LABEL, partner)
                .apply();
    }

    public static void clearUnread(Context context) {
        if (context == null) return;
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putInt(KEY_UNREAD, 0).apply();
    }

    public static void clearChatNotifications(Context context) {
        if (context == null) return;
        try {
            NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) {
                synchronized (activeChatNotificationIds) {
                    for (Integer id : activeChatNotificationIds) {
                        manager.cancel(id);
                    }
                    activeChatNotificationIds.clear();
                }
            }
        } catch (Throwable t) {
            Log.w(TAG, "clearChatNotifications error: " + t.getMessage());
        }
    }

    public static void updateMusicNotification(Context context, String title, String artist, boolean isPlaying, String action) {
        if (context == null) return;
        try {
            NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager == null) return;

            if (!isPlaying && "stop".equals(action)) {
                manager.cancel(MUSIC_NOTIFICATION_ID);
                if (instance != null) {
                    try {
                        instance.stopForeground(true);
                    } catch (Throwable ignored) {}
                }
                return;
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                NotificationChannel channel = new NotificationChannel(
                        CHANNEL_MUSIC_ID, "Dudu Music Player", NotificationManager.IMPORTANCE_DEFAULT
                );
                channel.setDescription("Playback controls and status for Bedtime Lofi");
                channel.enableVibration(false);
                channel.setSound(null, null);
                channel.setShowBadge(false);
                manager.createNotificationChannel(channel);
            }

            Intent openIntent = new Intent(context, MainActivity.class);
            openIntent.setAction("ACTION_OPEN_MUSIC");
            openIntent.putExtra("target_tab", "music");
            openIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent openPending = PendingIntent.getActivity(
                    context, 100, openIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            Intent prevIntent = new Intent(context, MainActivity.class);
            prevIntent.setAction("ACTION_MUSIC_PREV");
            prevIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent prevPending = PendingIntent.getActivity(
                    context, 101, prevIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            Intent toggleIntent = new Intent(context, MainActivity.class);
            toggleIntent.setAction("ACTION_MUSIC_TOGGLE");
            toggleIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent togglePending = PendingIntent.getActivity(
                    context, 102, toggleIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            Intent nextIntent = new Intent(context, MainActivity.class);
            nextIntent.setAction("ACTION_MUSIC_NEXT");
            nextIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent nextPending = PendingIntent.getActivity(
                    context, 103, nextIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            android.graphics.Bitmap duduArt = null;
            try {
                duduArt = android.graphics.BitmapFactory.decodeResource(context.getResources(), R.mipmap.ic_launcher);
            } catch (Throwable ignored) {}

            androidx.media.app.NotificationCompat.MediaStyle mediaStyle = new androidx.media.app.NotificationCompat.MediaStyle()
                    .setShowActionsInCompactView(0, 1, 2);

            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_MUSIC_ID)
                    .setSmallIcon(R.mipmap.ic_launcher)
                    .setContentTitle("🐻 " + title)
                    .setContentText(artist + (isPlaying ? " • Playing 🎵" : " • Paused ⏸"))
                    .setContentIntent(openPending)
                    .setOngoing(isPlaying)
                    .setAutoCancel(!isPlaying)
                    .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                    .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                    .setStyle(mediaStyle)
                    .addAction(android.R.drawable.ic_media_previous, "Prev", prevPending)
                    .addAction(isPlaying ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play, isPlaying ? "Pause" : "Play", togglePending)
                    .addAction(android.R.drawable.ic_media_next, "Next", nextPending);

            if (duduArt != null) {
                builder.setLargeIcon(duduArt);
            }

            Notification musicNotif = builder.build();
            if (instance != null) {
                if (isPlaying) {
                    try {
                        instance.startForeground(MUSIC_NOTIFICATION_ID, musicNotif);
                    } catch (Throwable t) {
                        manager.notify(MUSIC_NOTIFICATION_ID, musicNotif);
                    }
                } else {
                    try {
                        instance.stopForeground(false);
                    } catch (Throwable ignored) {}
                    manager.notify(MUSIC_NOTIFICATION_ID, musicNotif);
                }
            } else {
                manager.notify(MUSIC_NOTIFICATION_ID, musicNotif);
            }
        } catch (Throwable t) {
            Log.w(TAG, "updateMusicNotification error: " + t.getMessage());
        }
    }

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
        acquireWakeLock();
        createNotificationChannels();
        // Immediately dismiss persistent companion notification
        try {
            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) {
                manager.cancel(COMPANION_NOTIFICATION_ID);
            }
        } catch (Throwable ignored) {}
        initWebSocket();
        startPingLoop();
        Log.d(TAG, "DuduCompanionService created");
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        createNotificationChannels();
        // Keep companion notification dismissed
        try {
            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) {
                manager.cancel(COMPANION_NOTIFICATION_ID);
            }
        } catch (Throwable ignored) {}

        ensureWebSocketConnected();
        return START_STICKY;
    }

    private void acquireWakeLock() {
        try {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null && (wakeLock == null || !wakeLock.isHeld())) {
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Dudu:CompanionWakeLock");
                wakeLock.setReferenceCounted(false);
                // Safe bounded wakelock timeout (60s) prevents Samsung Battery Guardian force-stop
                wakeLock.acquire(60 * 1000L);
            }
        } catch (Exception e) {
            Log.w(TAG, "Could not acquire WakeLock: " + e.getMessage());
        }
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager == null) return;

            // 1. High priority Chat message alert channel
            NotificationChannel chatChannel = new NotificationChannel(
                    CHANNEL_CHAT_ID,
                    "Dudu Chat Messages",
                    NotificationManager.IMPORTANCE_HIGH
            );
            chatChannel.setDescription("Notifications for incoming private messages");
            chatChannel.enableVibration(true);
            chatChannel.setShowBadge(true);
            manager.createNotificationChannel(chatChannel);

            // 2. Music Player Channel (Sound disabled, button actions visible)
            NotificationChannel musicChannel = new NotificationChannel(
                    CHANNEL_MUSIC_ID,
                    "Dudu Music Player",
                    NotificationManager.IMPORTANCE_DEFAULT
            );
            musicChannel.setDescription("Playback controls and status for Bedtime Lofi");
            musicChannel.enableVibration(false);
            musicChannel.setSound(null, null);
            musicChannel.setShowBadge(false);
            manager.createNotificationChannel(musicChannel);
        }
    }

    private void initWebSocket() {
        if (httpClient == null) {
            httpClient = new OkHttpClient.Builder()
                    .pingInterval(20, TimeUnit.SECONDS)
                    .retryOnConnectionFailure(true)
                    .connectTimeout(10, TimeUnit.SECONDS)
                    .readTimeout(0, TimeUnit.MILLISECONDS)
                    .build();
        }
        ensureWebSocketConnected();
    }

    private synchronized void ensureWebSocketConnected() {
        if (webSocket != null) return;
        if (isConnecting.getAndSet(true)) return;

        Request request = new Request.Builder()
                .url(WS_URL)
                .header("x-relay-token", RELAY_AUTH_TOKEN)
                .build();

        webSocket = httpClient.newWebSocket(request, new WebSocketListener() {
            @Override
            public void onOpen(WebSocket ws, Response response) {
                isConnecting.set(false);
                Log.d(TAG, "Native WebSocket connected to VPS");

                // Request sync for any messages missed while disconnected
                try {
                    SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
                    long lastNotified = prefs.getLong(KEY_LAST_NOTIFIED_TS, 0);
                    JSONObject syncReq = new JSONObject();
                    syncReq.put("type", "sync");
                    syncReq.put("sinceTimestamp", lastNotified > 0 ? (lastNotified - 2000) : (System.currentTimeMillis() - 86400000L));
                    ws.send(syncReq.toString());
                } catch (Exception ignored) {}
            }

            @Override
            public void onMessage(WebSocket ws, String text) {
                handleIncomingSocketText(text);
            }

            @Override
            public void onClosing(WebSocket ws, int code, String reason) {
                ws.close(1000, null);
            }

            @Override
            public void onClosed(WebSocket ws, int code, String reason) {
                webSocket = null;
                isConnecting.set(false);
                scheduleWsReconnect();
            }

            @Override
            public void onFailure(WebSocket ws, Throwable t, @Nullable Response response) {
                Log.w(TAG, "WebSocket failure: " + t.getMessage());
                webSocket = null;
                isConnecting.set(false);
                scheduleWsReconnect();
            }
        });
    }

    private void startPingLoop() {
        stopPingLoop();
        pingExecutor = Executors.newSingleThreadScheduledExecutor();
        // Send application text ping every 20 seconds to keep Cloudflare Tunnel active
        pingExecutor.scheduleWithFixedDelay(new Runnable() {
            @Override
            public void run() {
                WebSocket ws = webSocket;
                if (ws != null) {
                    try {
                        ws.send("{\"type\":\"ping\"}");
                    } catch (Exception e) {
                        webSocket = null;
                        ensureWebSocketConnected();
                    }
                } else {
                    ensureWebSocketConnected();
                }
            }
        }, 10, 20, TimeUnit.SECONDS);
    }

    private void stopPingLoop() {
        if (pingExecutor != null && !pingExecutor.isShutdown()) {
            pingExecutor.shutdownNow();
            pingExecutor = null;
        }
    }

    private void scheduleWsReconnect() {
        new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(new Runnable() {
            @Override
            public void run() {
                ensureWebSocketConnected();
            }
        }, 3000);
    }

    private void handleIncomingSocketText(String text) {
        try {
            JSONObject json = new JSONObject(text);
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);

            // 1. Direct message
            if (json.has("ciphertext") && json.has("iv")) {
                processSingleMessage(json, prefs);
                return;
            }

            // 2. Sync response with missed messages array
            if ("sync_response".equals(json.optString("type"))) {
                JSONArray messages = json.optJSONArray("messages");
                if (messages != null && !isAppForeground) {
                    for (int i = 0; i < messages.length(); i++) {
                        JSONObject m = messages.optJSONObject(i);
                        if (m != null) {
                            processSingleMessage(m, prefs);
                        }
                    }
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error parsing socket message: " + e.getMessage());
        }
    }

    private void processSingleMessage(JSONObject json, SharedPreferences prefs) {
        if (!json.has("ciphertext") || !json.has("iv")) return;

        long timestamp = json.optLong("timestamp", System.currentTimeMillis());
        long lastNotified = prefs.getLong(KEY_LAST_NOTIFIED_TS, 0);
        if (timestamp <= lastNotified) return;

        String myIdentity = prefs.getString(KEY_IDENTITY, "dudu");
        String sender = json.optString("sender", "");
        String senderLower = sender.toLowerCase();

        boolean isMeDudu = myIdentity.contains("dudu") || myIdentity.contains("kevin");
        boolean isSenderDudu = senderLower.contains("dudu") || senderLower.contains("kevin");

        // Ignore messages sent by self
        if (isMeDudu == isSenderDudu) {
            return;
        }

        prefs.edit().putLong(KEY_LAST_NOTIFIED_TS, timestamp).apply();

        String partnerLabel = isMeDudu ? "Bubu" : "Dudu";
        String msgType = json.optString("type", "text");
        String sessionId = json.optString("sessionId", "Chat");

        String previewText;
        if ("sticker".equals(msgType)) previewText = "Sent a sticker";
        else if ("image".equals(msgType)) previewText = "Sent a photo";
        else if ("video".equals(msgType)) previewText = "Sent a video";
        else previewText = "Sent a message";

        // Show heads-up alert whenever user is not actively on the foreground app
        if (!isAppForeground) {
            int currentUnread = prefs.getInt(KEY_UNREAD, 0) + 1;
            prefs.edit().putInt(KEY_UNREAD, currentUnread).apply();

            showHeadsUpMessageNotification(partnerLabel, sessionId, previewText);
        }
    }

    private void showHeadsUpMessageNotification(String partner, String topic, String preview) {
        try {
            long now = System.currentTimeMillis();
            if (now - lastHeadsUpTs < 1500) {
                return;
            }
            lastHeadsUpTs = now;

            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager == null) return;

            Intent intent = new Intent(this, MainActivity.class);
            intent.setAction("ACTION_OPEN_CHAT");
            intent.putExtra("target_tab", "chat");
            intent.putExtra("target_session", topic);
            intent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);

            PendingIntent pendingIntent = PendingIntent.getActivity(
                    this, (int) System.currentTimeMillis(), intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            String title = String.format("[%s] %s", topic, partner);

            NotificationCompat.Builder alertBuilder = new NotificationCompat.Builder(this, CHANNEL_CHAT_ID)
                    .setSmallIcon(R.mipmap.ic_launcher)
                    .setContentTitle(title)
                    .setContentText(preview)
                    .setContentIntent(pendingIntent)
                    .setAutoCancel(true)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setDefaults(NotificationCompat.DEFAULT_ALL);

            int notifId = (int) (System.currentTimeMillis() % 100000);
            activeChatNotificationIds.add(notifId);
            manager.notify(notifId, alertBuilder.build());
        } catch (Throwable t) {
            Log.w(TAG, "Safe guard caught showHeadsUpNotification error: " + t.getMessage());
        }
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        Log.d(TAG, "onTaskRemoved triggered: app swiped away.");
        isAppForeground = false;
        ensureWebSocketConnected();
        super.onTaskRemoved(rootIntent);
    }

    @Override
    public void onDestroy() {
        Log.w(TAG, "DuduCompanionService destroyed. Cleaning up.");
        if (instance == this) {
            instance = null;
        }
        stopPingLoop();
        if (webSocket != null) {
            try { webSocket.close(1000, "Service destroyed"); } catch (Exception ignored) {}
            webSocket = null;
        }
        if (wakeLock != null && wakeLock.isHeld()) {
            try { wakeLock.release(); } catch (Exception ignored) {}
            wakeLock = null;
        }
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
