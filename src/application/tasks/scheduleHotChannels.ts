import { CronJob } from "cron";
import type { TextChannel } from "discord.js";
import type { CustomClient } from "../../domain/types/customClient";
import logger from "../../infrastructure/logger";
import { generateChannelActivityRanking } from "../usecases/getHotChannels";

export function scheduleHotChannels(
  client: CustomClient,
  channelId: string,
  time: string,
): void {
  const job = new CronJob(time, async () => {
    logger.info("[INFO] Posting hot channels cron job started");
    const guild = client.guilds.cache.first();
    if (!guild) {
      logger.error("Guild not found");
      throw new Error("Guild not found");
    }
    logger.info("[INFO] Generating hot channels ranking");
    const ranking = await generateChannelActivityRanking(guild);
    logger.info("[INFO] Generated hot channels ranking");
    logger.info("[INFO] Finding hot channels channel");
    const channel = guild.channels.cache.find(
      (ch) => ch.id === channelId,
    ) as TextChannel;
    if (channel) {
      logger.info("[INFO] Found hot channels channel");
      await channel.send({ embeds: [ranking] });
    } else {
      logger.error("[ERROR] Hot channels channel not found");
    }
  });
  job.start();
}
