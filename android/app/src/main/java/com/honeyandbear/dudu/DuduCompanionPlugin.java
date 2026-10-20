package com.honeyandbear.dudu;

import android.graphics.Color;
import android.view.Window;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

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
}
