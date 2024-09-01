import { CronJob } from "cron";
import { CustomClient } from "../types/customClient";
import { getHotChannels } from "../usecases/getHotChannels";
import { TextChannel } from "discord.js";

export function scheduleHotChannels(client: CustomClient, channelId: string, time: string): void {
  const job = new CronJob(time, async () => {
    console.log("Job started");
    const guild = client.guilds.cache.first();
    if (guild) {
      const ranking = await getHotChannels(guild);
      const channel = guild.channels.cache.find((ch) => ch.id === channelId) as TextChannel;

      if (channel) {
        await channel.send(ranking);
      }
    }
  });

  job.start();
}
