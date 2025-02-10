import { Events, type Guild, type GuildMember, type Role } from "discord.js";
import unAuthorizedRoleProperty from "../../domain/roles/unAuthorized";
import type { CustomClient } from "../../domain/types/customClient";
import createRoleIfNotFound from "../../utils/createRoleNotFound";

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
      customRole: unAuthorizedRoleProperty,
    });
    await member.roles.add(role);
    console.log(
      `Unauthorized role has been assigned to ${member.displayName}.`,
    );
  } catch (error) {
    console.error("Error creating Unauthorized role:", error);
  }
}
