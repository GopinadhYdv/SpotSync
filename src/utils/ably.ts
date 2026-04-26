import * as Ably from "ably";

let ably: Ably.Realtime | null = null;

type MessageHandler = (message: { data: any }) => void;

class LocalRealtimeChannel {
  private channelName: string;
  private broadcast: BroadcastChannel | null;
  private listeners: Map<string, Set<MessageHandler>>;
  private onMessage: ((event: MessageEvent) => void) | null;

  constructor(channelName: string) {
    this.channelName = channelName;
    this.broadcast = typeof window !== "undefined" && "BroadcastChannel" in window
      ? new BroadcastChannel(channelName)
      : null;
    this.listeners = new Map();
    this.onMessage = this.broadcast
      ? (event: MessageEvent) => {
          const { name, data } = event.data || {};
          const handlers = this.listeners.get(name);
          if (!handlers) return;
          handlers.forEach((handler) => handler({ data }));
        }
      : null;

    if (this.broadcast && this.onMessage) {
      this.broadcast.addEventListener("message", this.onMessage);
    }
  }

  subscribe(name: string, handler: MessageHandler) {
    if (!this.listeners.has(name)) this.listeners.set(name, new Set());
    this.listeners.get(name)?.add(handler);
  }

  publish(name: string, data: any) {
    this.broadcast?.postMessage({ name, data, channelName: this.channelName });
  }

  unsubscribe() {
    if (this.broadcast && this.onMessage) {
      this.broadcast.removeEventListener("message", this.onMessage);
      this.broadcast.close();
    }
    this.listeners.clear();
  }
}

import { ABLY_API_KEY } from "./env";

export const getAblyClient = () => {
  if (!ably && typeof window !== "undefined") {
    if (ABLY_API_KEY && ABLY_API_KEY !== "YOUR_ABLY_API_KEY") {
      ably = new Ably.Realtime(ABLY_API_KEY);
    }
  }
  return ably;
};

export const getEventChannel = (eventId: string) => {
  if (typeof window === "undefined") return null;

  const client = getAblyClient();
  if (client) {
    return client.channels.get(`event-seats-${eventId}`);
  }

  return new LocalRealtimeChannel(`event-seats-${eventId}`);
};
