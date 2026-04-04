import type { DiscordChannelPort } from "./discordChannelPort";
import type { DiscordGuildPort } from "./discordGuildPort";
import type { DiscordMemberPort } from "./discordMemberPort";
import type { DiscordMessagePort } from "./discordMessagePort";
import type { EmailAuthPort } from "./emailAuthPort";
import type { ITSCorePort } from "./itsCorePort";
import type { ScheduledMessagePort } from "./scheduledMessagePort";

/**
 * アプリケーション全体の依存オブジェクトをまとめた型
 * composition root（main.ts）で組み立て、interface 層経由で UseCase に渡す
 */
export interface AppDeps {
  itsCorePort: ITSCorePort;
  emailAuthPort: EmailAuthPort;
  discordMemberPort: DiscordMemberPort;
  discordChannelPort: DiscordChannelPort;
  discordGuildPort: DiscordGuildPort;
  discordMessagePort: DiscordMessagePort;
  scheduledMessagePort: ScheduledMessagePort;
}
