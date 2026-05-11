export interface DoorStatus {
  isOpen: boolean;
  message?: string;
}

/**
 * 開室状況を取得するPort
 * 具体的な通信方式（WebSocket, HTTP等）は Infrastructure 層が決定する
 */
export interface DoorStatusPort {
  fetchStatus(): Promise<DoorStatus>;
}
