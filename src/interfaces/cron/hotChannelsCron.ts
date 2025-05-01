import { CronJob } from "cron";
import type { CustomClient } from "../../domain/types/customClient";
import { postHotChannels } from "../../application/usecases/postHotChannels";

export function scheduleHotChannelsCron(
  client: CustomClient,
  channelId: string,
  time: string
): void {
  const job = new CronJob(time, async () => {
    await postHotChannels(client, channelId);
  });
  job.start();
}
