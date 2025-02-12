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
    try {
      logger.info("[INFO] Posting hot channels cron job started");
      const guild = client.guilds.cache.first();
      if (guild) {
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
      } else {
        logger.error("[ERROR] Guild not found");
      }
    } catch (error) {
      logger.error(
        "[ERROR] An error occurred in the hot channels cron job:",
        error,
      );
    }
  });
  job.start();
}
