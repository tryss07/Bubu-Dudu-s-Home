/**
 * WebSocket client service with reconnect backoff and heartbeat
 */

export type ConnectionStatus = 'connected' | 'connecting' | 'reconnecting' | 'disconnected';

export class ChatSocketClient {
  private url: string;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: any = null;
  private heartbeatTimer: any = null;

  constructor(url = 'wss://chat.nexora-v1.my.id/chat-socket?token=415abdb5c1ff97e7de8c9f2c43be8ed4efba6f49ad912f301323212c27dacf5a') {
    this.url = url;
  }

  public connect(
    onMessage: (data: any) => void,
    onStatusChange: (status: ConnectionStatus) => void
  ) {
    onStatusChange('connecting');
    try {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        onStatusChange('connected');
        this.startHeartbeat();
      };
      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type !== 'pong') onMessage(payload);
        } catch (e) {}
      };
      this.ws.onclose = () => {
        this.stopHeartbeat();
        onStatusChange('reconnecting');
        this.scheduleReconnect(onMessage, onStatusChange);
      };
    } catch (e) {
      this.scheduleReconnect(onMessage, onStatusChange);
    }
  }

  private scheduleReconnect(onMessage: any, onStatusChange: any) {
    if (this.reconnectTimer) return;
    this.reconnectAttempts++;
    const delay = Math.min(15000, Math.pow(2, this.reconnectAttempts - 1) * 1000);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect(onMessage, onStatusChange);
    }, delay);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
  }

  public send(payload: any): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }
}
