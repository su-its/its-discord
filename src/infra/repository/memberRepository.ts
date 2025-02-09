import type { PrismaClient } from "@shizuoka-its/core";
import type {
  DiscordAccount as PrismaDiscordAccount,
  Member as PrismaMember,
} from "@shizuoka-its/core";
import type Department from "../../entities/department";
import type Member from "../../entities/member";
import type {
  ConnectDiscordAccountInput,
  IMemberRepository,
  MemberCreateInput,
  MemberUpdateInput,
} from "./IMemberRepository";
import { RepositoryError } from "./RepositoryError";

export default class MemberRepository implements IMemberRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  private convertToMember(
    member: PrismaMember & { discordAccounts: PrismaDiscordAccount[] },
  ): Member {
    return {
      id: member.id,
      name: member.name,
      student_number: member.studentId,
      department: member.department as Department,
      mail: member.email,
      discordId: member.discordAccounts[0]?.id, // TODO: 複数アカウントに対応する https://github.com/su-its/its-discord/issues/70
    };
  }

  async getAll(): Promise<Member[]> {
    try {
      const members = await this.prisma.member.findMany({
        include: { discordAccounts: true },
      });
      return members.map((m) => this.convertToMember(m));
    } catch (error) {
      throw new RepositoryError(
        "Failed to get all members",
        error instanceof Error ? error : undefined,
      );
    }
  }

  async getById(id: string): Promise<Member | null> {
    try {
      const member = await this.prisma.member.findUnique({
        where: { id },
        include: { discordAccounts: true },
      });
      return member ? this.convertToMember(member) : null;
    } catch (error) {
      throw new RepositoryError(
        `Failed to get member by id: ${id}`,
        error instanceof Error ? error : undefined,
      );
    }
  }

  async getByDiscordId(discordId: string): Promise<Member | null> {
    try {
      const member = await this.prisma.member.findFirst({
        where: { discordAccounts: { some: { id: discordId } } },
        include: { discordAccounts: true },
      });
      return member ? this.convertToMember(member) : null;
    } catch (error) {
      throw new RepositoryError(
        `Failed to get member by discord id: ${discordId}`,
        error instanceof Error ? error : undefined,
      );
    }
  }

  async getByEmail(email: string): Promise<Member | null> {
    try {
      const member = await this.prisma.member.findFirst({
        where: { email },
        include: { discordAccounts: true },
      });
      return member ? this.convertToMember(member) : null;
    } catch (error) {
      throw new RepositoryError(
        `Failed to get member by email: ${email}`,
        error instanceof Error ? error : undefined,
      );
    }
  }

  async insert(arg: MemberCreateInput): Promise<Member> {
    try {
      const created = await this.prisma.member.create({
        data: {
          name: arg.name,
          studentId: arg.student_number,
          department: arg.department,
          email: arg.mail,
        },
        include: { discordAccounts: true },
      });
      return this.convertToMember(created);
    } catch (error) {
      throw new RepositoryError(
        "Failed to insert new member",
        error instanceof Error ? error : undefined,
      );
    }
  }

  async update(arg: MemberUpdateInput): Promise<Member> {
    try {
      const updated = await this.prisma.member.update({
        where: { id: arg.id },
        data: {
          name: arg.name,
          studentId: arg.student_number,
          department: arg.department,
          email: arg.mail,
        },
        include: { discordAccounts: true },
      });
      return this.convertToMember(updated);
    } catch (error) {
      throw new RepositoryError(
        `Failed to update member with id: ${arg.id}`,
        error instanceof Error ? error : undefined,
      );
    }
  }

  async connectDiscordAccount(
    arg: ConnectDiscordAccountInput,
  ): Promise<Member> {
    try {
      // TODO: 複数アカウントに対応する https://github.com/su-its/its-discord/issues/70
      const existingDiscordAccounts = await this.prisma.discordAccount.findMany(
        {
          where: { memberId: arg.memberId },
        },
      );
      if (existingDiscordAccounts.length > 0) {
        throw new RepositoryError("Member already has a Discord account");
      }
      const updated = await this.prisma.member.update({
        where: { id: arg.memberId },
        data: {
          discordAccounts: {
            connectOrCreate: {
              where: { id: arg.discordAccount.id },
              create: {
                id: arg.discordAccount.id,
                nickName: arg.discordAccount.nickName,
              },
            },
          },
        },
        include: { discordAccounts: true },
      });
      return this.convertToMember(updated);
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      throw new RepositoryError(
        `Failed to connect Discord account for member id: ${arg.memberId}`,
        error instanceof Error ? error : undefined,
      );
    }
  }
}
