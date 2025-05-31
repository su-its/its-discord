import { CronJob } from "cron";
import { postHotChannels } from "../../application/usecases/postHotChannels";

export function scheduleHotChannelsCron(channelId: string, time: string): void {
  const job = new CronJob(time, async () => {
    await postHotChannels(channelId);
  });
  job.start();
}
