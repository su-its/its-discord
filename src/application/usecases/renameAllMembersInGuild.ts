import type { Guild, GuildMember } from "discord.js";
import { itsCoreService } from "../services/itsCoreService";
import logger from "../../infrastructure/logger";

export async function renameAllMembersInGuild(guild: Guild): Promise<{
  successCount: number;
  failureCount: number;
  failedMembers: GuildMember[];
}> {
  const members = await guild.members.fetch();
  let successCount = 0;
  let failureCount = 0;
  const failedMembers: GuildMember[] = [];

  const renamePromises = members.map(async (member) => {
    try {
      const itsMember = await itsCoreService.getMemberByDiscordId(member.id);
      if (!itsMember) {
        // NOTE: DiscordIDとの紐づけが行われていないユーザーもいるため、無視する
        return;
      }
      await member.setNickname(itsMember.name);
      successCount++;
    } catch (error) {
      failureCount++;
      failedMembers.push(member);
      logger.error(`Failed to rename ${member}: ${error}`);
    }
  });

  await Promise.all(renamePromises);

  return { successCount, failureCount, failedMembers };
}
