import { CronJob } from "cron";
import { postHotChannels } from "../../application/usecases/postHotChannels";
import type { CustomClient } from "../../domain/types/customClient";

export function scheduleHotChannelsCron(
  client: CustomClient,
  channelId: string,
  time: string,
): void {
  const job = new CronJob(time, async () => {
    await postHotChannels(client, channelId);
  });
  job.start();
}
