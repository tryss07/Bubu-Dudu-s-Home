package com.honeyandbear.dudu;

import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(DuduCompanionPlugin.class);
        super.onCreate(savedInstanceState);

        // Start native Companion Service
        DuduCompanionService.start(this);

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
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        if (intent == null) return;
        String action = intent.getAction();
        String targetTab = intent.getStringExtra("target_tab");
        if ("ACTION_OPEN_CHAT".equals(action) || "chat".equals(targetTab)) {
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().post(() -> {
                    getBridge().getWebView().evaluateJavascript(
                        "window.location.hash = '#chat'; if (typeof switchTab === 'function') switchTab('chat');", null
                    );
                });
            }
        }
    }
}
