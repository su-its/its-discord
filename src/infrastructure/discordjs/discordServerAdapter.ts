import {
  type APIEmbedField,
  ChannelType,
  type Role as DiscordRole,
  EmbedBuilder,
  type Guild,
  type GuildMember,
  SnowflakeUtil,
  type TextChannel,
} from "discord.js";
import type { DiscordChannel, DiscordChannelPort } from "../../application/ports/discordChannelPort";
import type { DiscordGuildPort } from "../../application/ports/discordGuildPort";
import type { DiscordMember, DiscordMemberPort } from "../../application/ports/discordMemberPort";
import type { DiscordMessagePort } from "../../application/ports/discordMessagePort";
import type { CustomClient } from "../../domain/types/customClient";
import type Role from "../../domain/types/role";
import logger from "../logger";

/**
 * 複数のDiscord Portを実装するAdapter（ヘキサゴナルアーキテクチャ）
 * Discord.jsの詳細をInfrastructure層に隠蔽
 */
export class DiscordServerAdapter
  implements DiscordMemberPort, DiscordChannelPort, DiscordGuildPort, DiscordMessagePort
{
  constructor(private client: CustomClient) {}

  // DiscordMemberPort implementation
  async getGuildMembers(guildId: string): Promise<DiscordMember[]> {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) throw new Error(`Guild not found: ${guildId}`);

    const members = await guild.members.fetch();
    return members.map((member) => ({
      id: member.id,
      displayName: member.displayName,
      nickname: member.nickname || undefined,
    }));
  }

  async setMemberNickname(guildId: string, memberId: string, nickname: string): Promise<void> {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) throw new Error(`Guild not found: ${guildId}`);

    const member = await guild.members.fetch(memberId);
    if (!member) throw new Error(`Member not found: ${memberId}`);

    await member.setNickname(nickname);
  }

  async addRoleToMember(guildId: string, memberId: string, role: Role): Promise<void> {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) throw new Error(`Guild not found: ${guildId}`);

    const member = await guild.members.fetch(memberId);
    if (!member) throw new Error(`Member not found: ${memberId}`);

    const discordRole = await this.createRoleIfNotFound(guild, role);
    await member.roles.add(discordRole);
  }

  async removeRoleFromMember(guildId: string, memberId: string, role: Role): Promise<void> {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) throw new Error(`Guild not found: ${guildId}`);

    const member = await guild.members.fetch(memberId);
    if (!member) throw new Error(`Member not found: ${memberId}`);

    const discordRole = await this.createRoleIfNotFound(guild, role);
    await member.roles.remove(discordRole);
  }

  // DiscordChannelPort implementation
  async getTextChannels(guildId: string): Promise<DiscordChannel[]> {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) throw new Error(`Guild not found: ${guildId}`);

    const channels = await guild.channels.fetch();
    return channels
      .filter((channel): channel is TextChannel => channel !== null && channel.type === ChannelType.GuildText)
      .map((channel) => ({
        id: channel.id,
        name: channel.name,
      }));
  }

  async getChannelMessageCount(channelId: string): Promise<number> {
    const channel = (await this.client.channels.fetch(channelId)) as TextChannel;
    if (!channel) throw new Error(`Channel not found: ${channelId}`);

    const now = new Date();
    const oneDayAgoSnowflake = SnowflakeUtil.generate({
      timestamp: now.getTime() - 24 * 60 * 60 * 1000,
    });

    let totalMessages = 0;
    let lastId: string | undefined;

    while (true) {
      const messages = await channel.messages.fetch({
        limit: 100,
        after: lastId || oneDayAgoSnowflake.toString(),
      });
      if (messages.size === 0) break;

      totalMessages += messages.size;
      lastId = messages.last()?.id;
      const lastMessage = messages.last();
      if (lastMessage && lastMessage.createdTimestamp < oneDayAgoSnowflake) break;
    }

    return totalMessages;
  }

  async sendEmbedToChannel(
    channelId: string,
    embed: {
      title: string;
      description: string;
      color: number;
      thumbnail?: { url: string };
      image?: { url: string };
      fields?: { name: string; value: string; inline?: boolean }[];
      footer?: { text: string; iconURL?: string };
      timestamp?: string;
    }
  ): Promise<void> {
    const channel = (await this.client.channels.fetch(channelId)) as TextChannel;
    if (!channel) throw new Error(`Channel not found: ${channelId}`);

    const embedBuilder = new EmbedBuilder();
    if (embed.title) embedBuilder.setTitle(embed.title);
    if (embed.description) embedBuilder.setDescription(embed.description);
    if (embed.color) embedBuilder.setColor(embed.color);
    if (embed.thumbnail) embedBuilder.setThumbnail(embed.thumbnail.url);
    if (embed.image) embedBuilder.setImage(embed.image.url);
    if (embed.footer) embedBuilder.setFooter(embed.footer);
    if (embed.fields) embedBuilder.addFields(embed.fields);
    if (embed.timestamp) embedBuilder.setTimestamp(new Date(embed.timestamp));

    await channel.send({ embeds: [embedBuilder] });
  }

  // DiscordGuildPort implementation
  async getFirstGuild(): Promise<string> {
    const guild = this.client.guilds.cache.first();
    if (!guild) throw new Error("No guild found");

    return guild.id;
  }

  async ensureRoleExists(guildId: string, role: Role): Promise<void> {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) throw new Error(`Guild not found: ${guildId}`);

    await this.createRoleIfNotFound(guild, role);
  }

  // DiscordMessagePort implementation
  async sendDirectMessage(userId: string, message: string): Promise<void> {
    const user = await this.client.users.fetch(userId);
    if (!user) throw new Error(`User not found: ${userId}`);

    await user.send(message);
  }

  async sendMessageToChannel(channelId: string, message: string): Promise<void> {
    const channel = (await this.client.channels.fetch(channelId)) as TextChannel;
    if (!channel) throw new Error(`Channel not found: ${channelId}`);

    await channel.send(message);
    logger.debug(`Message sent to channel ${channelId}: ${message.substring(0, 50)}...`);
  }

  private async createRoleIfNotFound(guild: Guild, role: Role): Promise<DiscordRole> {
    const roles = await guild.roles.fetch();
    let discordRole = roles.find((r) => r.name === role.name);

    if (!discordRole) {
      discordRole = await guild.roles.create({
        name: role.name,
        color: role.color,
        reason: role.reason,
      });
    }

    return discordRole;
  }
}

// NOTE: これはDIコンテナで注入されるため、ここでは直接エクスポートしない
// export const discordServerAdapter = new DiscordServerAdapter(client);
