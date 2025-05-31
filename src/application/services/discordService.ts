import type { DiscordChannelPort } from "../ports/discordChannelPort";
import type { DiscordGuildPort } from "../ports/discordGuildPort";
import type { DiscordMemberPort } from "../ports/discordMemberPort";
import type { DiscordMessagePort } from "../ports/discordMessagePort";

export interface DiscordService
  extends DiscordMemberPort,
    DiscordChannelPort,
    DiscordGuildPort,
    DiscordMessagePort {}
