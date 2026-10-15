package com.honeyandbear.dudu;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

public class DuduBootReceiver extends BroadcastReceiver {
    private static final String TAG = "DuduBootReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;
        String action = intent.getAction();
        if (Intent.ACTION_BOOT_COMPLETED.equals(action) || Intent.ACTION_MY_PACKAGE_REPLACED.equals(action)) {
            Log.d(TAG, "Boot or package update detected. Starting DuduCompanionService.");
            DuduCompanionService.start(context);
        }
    }
}
