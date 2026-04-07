/**
 * Cronジョブのスケジューリングを抽象化するPort
 */
export interface CronSchedulerPort {
  scheduleJob(id: string, cronSchedule: string): void;
  cancelJob(id: string): void;
}
