import type { DoorStatus, DoorStatusPort } from "@application/ports";

const WS_TIMEOUT_MS = 8000;

interface WoodyStatusMessage {
  state: "opened" | "closed";
  battery: number;
  updated_at: string;
}

function parseMessage(data: string): DoorStatus {
  const parsed: WoodyStatusMessage = JSON.parse(data);
  return { isOpen: parsed.state === "opened" };
}

/**
 * Woody さんの its-status サーバーから開室状況を取得するアダプタ
 */
export class WoodyDoorStatusAdapter implements DoorStatusPort {
  constructor(private readonly url: string) {}

  getStatus(): Promise<DoorStatus> {
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
