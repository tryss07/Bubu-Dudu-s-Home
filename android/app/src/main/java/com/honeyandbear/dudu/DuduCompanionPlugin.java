package com.honeyandbear.dudu;

import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;
import android.view.Window;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "DuduCompanion")
public class DuduCompanionPlugin extends Plugin {

    @PluginMethod
    public void setStatusBarStyle(PluginCall call) {
        boolean isDark = call.getBoolean("isDark", false);
        if (getActivity() != null) {
            getActivity().runOnUiThread(() -> {
                Window window = getActivity().getWindow();
                WindowInsetsControllerCompat insetsController = WindowCompat.getInsetsController(window, window.getDecorView());
                if (insetsController != null) {
                    // Light mode -> black icons; Dark mode -> white icons
                    insetsController.setAppearanceLightStatusBars(!isDark);
                    insetsController.setAppearanceLightNavigationBars(!isDark);
                }
                int bgColor = isDark ? Color.parseColor("#1C1917") : Color.parseColor("#FAF5EE");
                window.getDecorView().setBackgroundColor(bgColor);
                if (getBridge() != null && getBridge().getWebView() != null) {
                    getBridge().getWebView().setBackgroundColor(bgColor);
                }
            });
        }
        call.resolve();
    }

    @PluginMethod
    public void startService(PluginCall call) {
        DuduCompanionService.start(getContext());
        call.resolve();
    }

    @PluginMethod
    public void updateStats(PluginCall call) {
        int food = call.getInt("food", 80);
        int sleep = call.getInt("sleep", 90);
        int unread = call.getInt("unread", 0);

        DuduCompanionService.updateStats(getContext(), food, sleep, unread);
        call.resolve();
    }

    @PluginMethod
    public void setIdentity(PluginCall call) {
        String identity = call.getString("identity", "dudu");
        DuduCompanionService.setIdentity(getContext(), identity);
        call.resolve();
    }

    @PluginMethod
    public void clearUnread(PluginCall call) {
        DuduCompanionService.clearUnread(getContext());
        call.resolve();
    }

    @PluginMethod
    public void clearChatNotifications(PluginCall call) {
        DuduCompanionService.clearChatNotifications(getContext());
        call.resolve();
    }

    @PluginMethod
    public void updateMusicNotification(PluginCall call) {
        String title = call.getString("title", "Bedtime Lofi");
        String artist = call.getString("artist", "Dudu & Bubu");
        boolean isPlaying = call.getBoolean("isPlaying", false);
        String action = call.getString("action", "playing");

        DuduCompanionService.updateMusicNotification(getContext(), title, artist, isPlaying, action);
        call.resolve();
    }

    @PluginMethod
    public void requestBatteryOptimization(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            try {
                PowerManager pm = (PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
                String pkg = getContext().getPackageName();
                if (pm != null && !pm.isIgnoringBatteryOptimizations(pkg)) {
                    Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                    intent.setData(Uri.parse("package:" + pkg));
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    getContext().startActivity(intent);
                    JSObject ret = new JSObject();
                    ret.put("requested", true);
                    call.resolve(ret);
                    return;
                }
            } catch (Throwable t) {
                // Ignore
            }
        }
        JSObject ret = new JSObject();
        ret.put("requested", false);
        call.resolve(ret);
    }

    @PluginMethod
    public void isBatteryOptimizationIgnored(PluginCall call) {
        boolean ignored = false;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            try {
                PowerManager pm = (PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
                String pkg = getContext().getPackageName();
                if (pm != null) {
                    ignored = pm.isIgnoringBatteryOptimizations(pkg);
                }
            } catch (Throwable ignoredException) {}
        }
        JSObject ret = new JSObject();
        ret.put("ignored", ignored);
        call.resolve(ret);
    }
}
