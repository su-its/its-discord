import { Events, type Guild, type GuildMember, type Role } from "discord.js";
import type { CustomClient } from "../../domain/types/customClient";
import createRoleIfNotFound from "../../utils/createRoleNotFound";
import roleRegistry from "../roles";
import { unAuthorizedRoleKey } from "../roles/implementations/unAuthorized";
export function setupGuildMemberAddHandler(client: CustomClient) {
  client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    await sendDM(member);
    await giveUnauthorizedRole(member);
  });
}

async function sendDM(member: GuildMember) {
  try {
    await member.send(
      `ようこそ ${member.displayName} さん！ ITS discord 認証botです!`,
    );
    await member.send("名前(フルネーム)を教えてください");
    console.log(`Welcome message sent to ${member.displayName}.`);
  } catch (error) {
    console.error("Error sending DM:", error);
  }
}

async function giveUnauthorizedRole(member: GuildMember) {
  try {
    const guild: Guild = member.guild;
    const role: Role = await createRoleIfNotFound({
      guild,
      role: roleRegistry.getRole(unAuthorizedRoleKey),
    });
    await member.roles.add(role);
    console.log(
      `Unauthorized role has been assigned to ${member.displayName}.`,
    );
  } catch (error) {
    console.error("Error creating Unauthorized role:", error);
  }
}
