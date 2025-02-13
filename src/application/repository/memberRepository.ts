import {
  type PrismaClient,
  PrismaRecordDoesNotExistError,
  PrismaUniqueConstraintError,
} from "@shizuoka-its/core";
import type {
  DiscordAccount as PrismaDiscordAccount,
  Member as PrismaMember,
} from "@shizuoka-its/core";
import type Department from "../../domain/entities/department";
import type Member from "../../domain/entities/member";
import type {
  ConnectDiscordAccountInput,
  IMemberRepository,
  MemberCreateInput,
  MemberUpdateInput,
} from "./IMemberRepository";
import { RepositoryError } from "./RepositoryError";

const ALLOWED_EMAIL_DOMAIN = "@shizuoka.ac.jp";

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
    const members = await this.prisma.member.findMany({
      include: { discordAccounts: true },
    });
    return members.map((m) => this.convertToMember(m));
  }

  async getById(id: string): Promise<Member | null> {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: { discordAccounts: true },
    });
    return member ? this.convertToMember(member) : null;
  }

  async getByDiscordId(discordId: string): Promise<Member | null> {
    const member = await this.prisma.member.findFirst({
      where: { discordAccounts: { some: { id: discordId } } },
      include: { discordAccounts: true },
    });
    return member ? this.convertToMember(member) : null;
  }

  async getByEmail(email: string): Promise<Member | null> {
    const member = await this.prisma.member.findFirst({
      where: { email },
      include: { discordAccounts: true },
    });
    return member ? this.convertToMember(member) : null;
  }

  async insert(arg: MemberCreateInput): Promise<Member> {
    try {
      if (!arg.mail.endsWith(ALLOWED_EMAIL_DOMAIN)) {
        throw new RepositoryError("Invalid email domain");
      }
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
      if (error instanceof PrismaUniqueConstraintError) {
        // NOTE: UUIDであるID以外でUnique制約があるEmailフィールドが重複していると特定
        throw new RepositoryError(
          "The specified email address is already registered",
        );
      }
      throw error;
    }
  }

  async update(arg: MemberUpdateInput): Promise<Member> {
    try {
      if (arg.mail && !arg.mail.endsWith(ALLOWED_EMAIL_DOMAIN)) {
        throw new RepositoryError("Invalid email domain");
      }
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
      if (error instanceof PrismaUniqueConstraintError) {
        throw new RepositoryError(
          "The specified email address is already registered",
        );
      }
      if (error instanceof PrismaRecordDoesNotExistError) {
        throw new RepositoryError("Member to update not found");
      }
      throw error;
    }
  }

  async connectDiscordAccount(
    arg: ConnectDiscordAccountInput,
  ): Promise<Member> {
    // TODO: 複数アカウントに対応する https://github.com/su-its/its-discord/issues/70
    const existingDiscordAccounts = await this.prisma.discordAccount.findMany({
      where: { memberId: arg.memberId },
    });
    if (existingDiscordAccounts.length > 0) {
      throw new RepositoryError("Member already has a Discord account");
    }
    try {
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
      if (error instanceof PrismaRecordDoesNotExistError) {
        throw new RepositoryError(
          "Member to connect Discord account not found",
        );
      }
      throw error;
    }
  }
}
