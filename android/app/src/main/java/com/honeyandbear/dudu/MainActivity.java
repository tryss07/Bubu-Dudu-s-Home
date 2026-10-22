package com.honeyandbear.dudu;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.provider.Settings;
import android.view.Window;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import android.util.Log;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Crash Guard: Prevent unexpected background thread crashes from terminating the app
        final Thread.UncaughtExceptionHandler defaultHandler = Thread.getDefaultUncaughtExceptionHandler();
        Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> {
            Log.e("DuduCrashGuard", "Caught uncaught exception in thread: " + thread.getName(), throwable);
            if (defaultHandler != null) {
                if (!"main".equals(thread.getName())) {
                    Log.w("DuduCrashGuard", "Suppressed non-main thread exception to keep app running");
                    return;
                }
                defaultHandler.uncaughtException(thread, throwable);
            }
        });

        registerPlugin(DuduCompanionPlugin.class);
        super.onCreate(savedInstanceState);

        // Start native Companion Service
        DuduCompanionService.start(this);
        requestBatteryOptimizationExemption();

        Window window = getWindow();
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS | WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);

        WindowCompat.setDecorFitsSystemWindows(window, false);

        window.setStatusBarColor(Color.TRANSPARENT);
        window.setNavigationBarColor(Color.TRANSPARENT);

        window.getDecorView().setBackgroundColor(Color.parseColor("#fff8f4"));

        WindowInsetsControllerCompat insetsController = WindowCompat.getInsetsController(window, window.getDecorView());
        if (insetsController != null) {
            insetsController.setAppearanceLightStatusBars(true);
            insetsController.setAppearanceLightNavigationBars(true);
        }

        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().setBackgroundColor(Color.parseColor("#fff8f4"));
        }

        handleIntent(getIntent());
    }

    @Override
    public void onResume() {
        super.onResume();
        DuduCompanionService.setAppForeground(true);
        DuduCompanionService.clearUnread(this);
    }

    @Override
    public void onPause() {
        super.onPause();
        DuduCompanionService.setAppForeground(false);
    }

    @Override
    public void onTrimMemory(int level) {
        super.onTrimMemory(level);
        Log.w("DuduCrashGuard", "onTrimMemory received level: " + level);
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().post(() -> {
                try {
                    getBridge().getWebView().freeMemory();
                    getBridge().getWebView().clearCache(false);
                } catch (Throwable ignored) {}
            });
        }
        System.gc();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        if (intent == null) return;
        String action = intent.getAction();
        String targetTab = intent.getStringExtra("target_tab");
        if ("ACTION_MUSIC_PREV".equals(action)) {
            dispatchMusicControl("prev");
        } else if ("ACTION_MUSIC_TOGGLE".equals(action)) {
            dispatchMusicControl("toggle");
        } else if ("ACTION_MUSIC_NEXT".equals(action)) {
            dispatchMusicControl("next");
        } else if ("ACTION_OPEN_MUSIC".equals(action) || "music".equals(targetTab)) {
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().post(() -> {
                    getBridge().getWebView().evaluateJavascript(
                        "window.location.hash = '#music'; if (typeof switchTab === 'function') switchTab('music');", null
                    );
                });
            }
        } else if ("ACTION_OPEN_CHAT".equals(action) || "chat".equals(targetTab)) {
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().post(() -> {
                    getBridge().getWebView().evaluateJavascript(
                        "window.location.hash = '#chat'; if (typeof switchTab === 'function') switchTab('chat');", null
                    );
                });
            }
        }
    }

    private void dispatchMusicControl(String action) {
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().post(() -> {
                getBridge().getWebView().evaluateJavascript(
                    "window.dispatchEvent(new CustomEvent('dudu-music-control', { detail: { action: '" + action + "' } }));", null
                );
            });
        }
    }

    private void requestBatteryOptimizationExemption() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            try {
                PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
                String packageName = getPackageName();
                if (pm != null && !pm.isIgnoringBatteryOptimizations(packageName)) {
                    SharedPreferences prefs = getSharedPreferences("dudu_companion_prefs", Context.MODE_PRIVATE);
                    boolean prompted = prefs.getBoolean("battery_optimization_requested", false);
                    if (!prompted) {
                        prefs.edit().putBoolean("battery_optimization_requested", true).apply();
                        Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                        intent.setData(Uri.parse("package:" + packageName));
                        startActivity(intent);
                    }
                }
            } catch (Throwable t) {
                Log.w("MainActivity", "requestBatteryOptimizationExemption error: " + t.getMessage());
            }
        }
    }
}
