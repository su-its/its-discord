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
import type {
  DiscordChannel,
  DiscordGuild,
  DiscordMember,
  DiscordServerPort,
  EmbedData,
} from "../../application/ports/discordServerPort";
import type { CustomClient } from "../../domain/types/customClient";
import type Role from "../../domain/types/role";
import logger from "../logger";

/**
 * DiscordServerPortを実装するAdapter（ヘキサゴナルアーキテクチャ）
 * Discord.jsの詳細をInfrastructure層に隠蔽
 */
export class DiscordServerAdapter implements DiscordServerPort {
  constructor(private client: CustomClient) {}

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

  async setMemberNickname(
    guildId: string,
    memberId: string,
    nickname: string,
  ): Promise<void> {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) throw new Error(`Guild not found: ${guildId}`);

    const member = await guild.members.fetch(memberId);
    if (!member) throw new Error(`Member not found: ${memberId}`);

    await member.setNickname(nickname);
  }

  async getTextChannels(guildId: string): Promise<DiscordChannel[]> {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) throw new Error(`Guild not found: ${guildId}`);

    const channels = await guild.channels.fetch();
    return channels
      .filter(
        (channel): channel is TextChannel =>
          channel !== null && channel.type === ChannelType.GuildText,
      )
      .map((channel) => ({
        id: channel.id,
        name: channel.name,
        type: "text" as const,
      }));
  }

  async getChannelMessageCount(
    guildId: string,
    channelId: string,
  ): Promise<number> {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) throw new Error(`Guild not found: ${guildId}`);

    const channel = guild.channels.cache.get(channelId) as TextChannel;
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
      if (lastMessage && lastMessage.createdTimestamp < oneDayAgoSnowflake)
        break;
    }

    return totalMessages;
  }

  async sendEmbedToChannel(
    guildId: string,
    channelId: string,
    embedData: EmbedData,
  ): Promise<void> {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) throw new Error(`Guild not found: ${guildId}`);

    const channel = guild.channels.cache.get(channelId) as TextChannel;
    if (!channel) throw new Error(`Channel not found: ${channelId}`);

    const embed = new EmbedBuilder();
    if (embedData.title) embed.setTitle(embedData.title);
    if (embedData.description) embed.setDescription(embedData.description);
    if (embedData.color) embed.setColor(embedData.color);
    if (embedData.footer) embed.setFooter(embedData.footer);
    if (embedData.fields) embed.addFields(embedData.fields);

    await channel.send({ embeds: [embed] });
  }

  async addRoleToMember(
    guildId: string,
    memberId: string,
    role: Role,
  ): Promise<void> {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) throw new Error(`Guild not found: ${guildId}`);

    const member = await guild.members.fetch(memberId);
    if (!member) throw new Error(`Member not found: ${memberId}`);

    const discordRole = await this.createRoleIfNotFound(guild, role);
    await member.roles.add(discordRole);
  }

  async removeRoleFromMember(
    guildId: string,
    memberId: string,
    role: Role,
  ): Promise<void> {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) throw new Error(`Guild not found: ${guildId}`);

    const member = await guild.members.fetch(memberId);
    if (!member) throw new Error(`Member not found: ${memberId}`);

    const discordRole = await this.createRoleIfNotFound(guild, role);
    await member.roles.remove(discordRole);
  }

  async ensureRoleExists(guildId: string, role: Role): Promise<void> {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) throw new Error(`Guild not found: ${guildId}`);

    await this.createRoleIfNotFound(guild, role);
  }

  async getFirstGuild(): Promise<DiscordGuild> {
    const guild = this.client.guilds.cache.first();
    if (!guild) throw new Error("No guild found");

    return {
      id: guild.id,
      name: guild.name,
    };
  }

  async sendDirectMessage(memberId: string, message: string): Promise<void> {
    const user = await this.client.users.fetch(memberId);
    if (!user) throw new Error(`User not found: ${memberId}`);

    await user.send(message);
  }

  private async createRoleIfNotFound(
    guild: Guild,
    role: Role,
  ): Promise<DiscordRole> {
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
