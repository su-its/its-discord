import { CronJob } from "cron";
import { CustomClient } from "../types/customClient";
import { getHotChannels } from "../usecases/getHotChannels";
import { TextChannel } from "discord.js";

export function scheduleHotChannels(client: CustomClient) {
  const job = new CronJob("0 0 * * *", async () => {
    const guild = client.guilds.cache.first();
    if (guild) {
      const ranking = await getHotChannels(guild);
      const channel = guild.channels.cache.find((ch) => ch.name === "hot-channels") as TextChannel;

      if (channel) {
        await channel.send(ranking);
      }
    }
  });

  job.start();
}
