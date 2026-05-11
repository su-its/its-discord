import type { DoorStatus, DoorStatusPort } from "@application/ports";

const WS_TIMEOUT_MS = 8000;

interface RawDoorMessage {
  open?: boolean;
  isOpen?: boolean;
  status?: string;
  message?: string;
}

function parseMessage(data: string): DoorStatus {
  const parsed: RawDoorMessage = JSON.parse(data);
  const isOpen = parsed.open ?? parsed.isOpen ?? parsed.status === "open";

  return {
    isOpen,
    message: parsed.message,
  };
}

/**
 * WebSocket 経由で開室状況を取得するアダプタ
 */
export class WebSocketDoorStatusAdapter implements DoorStatusPort {
  constructor(private readonly url: string) {}

  fetchStatus(): Promise<DoorStatus> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.url);

      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error("Door status WebSocket timeout"));
      }, WS_TIMEOUT_MS);

      ws.addEventListener("message", (event) => {
        clearTimeout(timeout);
        try {
          const raw =
            typeof event.data === "string" ? event.data : String(event.data);
          resolve(parseMessage(raw));
        } catch {
          reject(new Error("Door status response parse error"));
        } finally {
          ws.close();
        }
      });

      ws.addEventListener("error", () => {
        clearTimeout(timeout);
        reject(new Error("Door status WebSocket error"));
      });
    });
  }
}
