import { Events, type Guild, type GuildMember, type Role } from "discord.js";
import type { CustomClient } from "../../domain/types/customClient";
import logger from "../../infrastructure/logger";
import createRoleIfNotFound from "../../utils/createRoleNotFound";
import roleRegistry from "../roles";
import { unAuthorizedRoleKey } from "../roles/implementations/unAuthorized";

/**
 * GuildMemberAdd イベントハンドラを設定する。
 * 新規メンバーが参加した際、ウェルカムDMの送信と未承認ロールの付与を行う。
 */
export function setupGuildMemberAddHandler(client: CustomClient): void {
  client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    logger.info(`New member joined: ${member.displayName} (${member.id})`);
    await sendDM(member);
    await giveUnauthorizedRole(member);
  });
}

/**
 * 新規メンバーへウェルカムDMを送信する。
 */
async function sendDM(member: GuildMember): Promise<void> {
  await member.send(
    `ようこそ ${member.displayName} さん！ ITS discord 認証botです!`,
  );
  await member.send("名前(フルネーム)を教えてください");
  logger.info(`Sent welcome DM to ${member.displayName} (${member.id})`);
}

/**
 * 新規メンバーに未承認ロールを付与する。
 */
async function giveUnauthorizedRole(member: GuildMember): Promise<void> {
  const guild: Guild = member.guild;
  const role: Role = await createRoleIfNotFound({
    guild,
    role: roleRegistry.getRole(unAuthorizedRoleKey),
  });
  await member.roles.add(role);
  logger.info(
    `Assigned Unauthorized role (${role.name}) to ${member.displayName} (${member.id})`,
  );
}
