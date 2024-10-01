import { CronJob } from "cron";
import type { CustomClient } from "../types/customClient";
import { generateChannelActivityRanking } from "../usecases/getHotChannels";
import type { TextChannel } from "discord.js";

export function scheduleHotChannels(
	client: CustomClient,
	channelId: string,
	time: string,
): void {
	const job = new CronJob(time, async () => {
		try {
			console.log("[INFO] Posting hot channels cron job started");
			const guild = client.guilds.cache.first();
			if (guild) {
				console.log("[INFO] Generating hot channels ranking");
				const ranking = await generateChannelActivityRanking(guild);
				console.log("[INFO] Generated hot channels ranking");
				console.log("[INFO] Finding hot channels channel");
				const channel = guild.channels.cache.find(
					(ch) => ch.id === channelId,
				) as TextChannel;
				if (channel) {
					console.log("[INFO] Found hot channels channel");
					await channel.send({ embeds: [ranking] });
				} else {
					console.error("[ERROR] Hot channels channel not found");
				}
			} else {
				console.error("[ERROR] Guild not found");
			}
		} catch (error) {
			console.error(
				"[ERROR] An error occurred in the hot channels cron job:",
				error,
			);
		}
	});
	job.start();
}
