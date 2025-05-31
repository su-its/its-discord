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
  MemberRenameResult,
} from "../../application/ports/discordServerPort";
import Department from "../../domain/entities/department";
import type InternalMember from "../../domain/entities/member";
import type { CustomClient } from "../../domain/types/customClient";
import type Role from "../../domain/types/role";
import roleRegistry, { roleRegistryKeys } from "../../domain/types/roles";
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

  async addDepartmentRoleToMember(
    guildId: string,
    memberId: string,
    member: InternalMember,
  ): Promise<void> {
    // 部署に対応するロールマッピング
    const departmentRoleMap: Record<string, Role> = {
      [Department.CS]: roleRegistry.getRole(roleRegistryKeys.csRoleKey),
      [Department.IA]: roleRegistry.getRole(roleRegistryKeys.iaRoleKey),
      [Department.BI]: roleRegistry.getRole(roleRegistryKeys.biRoleKey),
      [Department.GRADUATE]: roleRegistry.getRole(
        roleRegistryKeys.graduateRoleKey,
      ),
      [Department.OTHERS]: roleRegistry.getRole(roleRegistryKeys.othersRoleKey),
      [Department.OBOG]: roleRegistry.getRole(roleRegistryKeys.obOgRoleKey),
    };

    const role = departmentRoleMap[member.department];
    if (role) {
      await this.addRoleToMember(guildId, memberId, role);
    }
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

  async renameAllMembersInGuild(
    guildId: string,
    memberNameMap: Map<string, string>,
  ): Promise<MemberRenameResult> {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) throw new Error(`Guild not found: ${guildId}`);

    const members = await guild.members.fetch();
    let successCount = 0;
    let failureCount = 0;
    const failedMembers: DiscordMember[] = [];

    const renamePromises = members.map(async (member) => {
      try {
        const newName = memberNameMap.get(member.id);
        if (!newName) return; // スキップ

        await member.setNickname(newName);
        successCount++;
      } catch (error) {
        failureCount++;
        failedMembers.push({
          id: member.id,
          displayName: member.displayName,
          nickname: member.nickname || undefined,
        });
        logger.error(`Failed to rename ${member}: ${error}`);
      }
    });

    await Promise.all(renamePromises);
    return { successCount, failureCount, failedMembers };
  }

  async generateChannelActivityEmbedData(guildId: string): Promise<EmbedData> {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) throw new Error(`Guild not found: ${guildId}`);

    const now = new Date();
    const channels = await this.getTextChannels(guildId);

    const channelStats = await Promise.all(
      channels.map(async (channel) => ({
        id: channel.id,
        name: channel.name,
        count: await this.getChannelMessageCount(guildId, channel.id),
      })),
    );

    const targetChannels = channelStats.filter((channel) => channel.count > 0);
    const sortedStats = targetChannels
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
    const totalMessages = sortedStats.reduce(
      (sum, channel) => sum + channel.count,
      0,
    );

    const fields: APIEmbedField[] = sortedStats.map((channel, index) => {
      const percentage = ((channel.count / totalMessages) * 100).toFixed(1);
      return {
        name: `${index + 1}. https://discord.com/channels/${guildId}/${channel.id}`,
        value: `発言数: ${channel.count} (${percentage}%)`,
        inline: false,
      };
    });

    return {
      color: 0x0099ff,
      title: "Hot Channels Bot",
      description: `${now.toISOString().split("T")[0]} の発言数ランキング`,
      footer: { text: `合計発言数: ${totalMessages}` },
      fields,
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
