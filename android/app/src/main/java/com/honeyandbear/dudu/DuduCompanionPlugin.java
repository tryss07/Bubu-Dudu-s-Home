package com.honeyandbear.dudu;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "DuduCompanion")
public class DuduCompanionPlugin extends Plugin {

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
