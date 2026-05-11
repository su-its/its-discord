export interface DoorStatus {
  isOpen: boolean;
}

/**
 * 開室状況を取得するPort
 */
export interface DoorStatusPort {
  getStatus(): Promise<DoorStatus>;
}
