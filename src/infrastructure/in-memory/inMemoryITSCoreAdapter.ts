import type {
  ITSCorePort,
  MemberConnectionData,
  MemberNicknameUpdateData,
  MemberRegistrationData,
} from "../../application/ports/itsCorePort";
import Department from "../../domain/entities/department";
import type InternalMember from "../../domain/entities/member";
import logger from "../logger";

/**
 * ITSCorePort の in-memory 実装（ローカル検証用）
 * メンバーデータを Map で管理し、外部 DB に接続しない
 */
export class InMemoryITSCoreAdapter implements ITSCorePort {
  private members = new Map<string, InternalMember>();
  private discordIdToMemberId = new Map<string, string>();
  private nextId = 1;

  async registerMember(data: MemberRegistrationData): Promise<void> {
    const id = `mem_${this.nextId++}`;
    const member: InternalMember = {
      id,
      name: data.name,
      student_number: data.studentId,
      department: Department.OTHERS,
      mail: data.email,
    };
    this.members.set(id, member);
    logger.info(`[InMemory] Registered member: ${data.name} (${id})`);
  }

  async getMemberByDiscordId(
    discordId: string,
  ): Promise<InternalMember | undefined> {
    const memberId = this.discordIdToMemberId.get(discordId);
    if (!memberId) return undefined;
    return this.members.get(memberId);
  }

  async getMemberByEmail(email: string): Promise<InternalMember | undefined> {
    for (const member of this.members.values()) {
      if (member.mail === email) return member;
    }
    return undefined;
  }

  async connectDiscordAccount(data: MemberConnectionData): Promise<void> {
    const member = this.members.get(data.memberId);
    if (!member) {
      throw new Error(`[InMemory] Member not found: ${data.memberId}`);
    }
    member.discordId = data.discordAccountId;
    this.discordIdToMemberId.set(data.discordAccountId, data.memberId);
    logger.info(
      `[InMemory] Connected Discord ${data.discordAccountId} to member ${data.memberId}`,
    );
  }

  async getMemberList(): Promise<InternalMember[]> {
    return Array.from(this.members.values());
  }

  async updateMemberNickname(data: MemberNicknameUpdateData): Promise<void> {
    for (const member of this.members.values()) {
      if (member.discordId === data.discordAccountId) {
        member.discordNickname = data.discordNickName;
        logger.info(
          `[InMemory] Updated nickname for ${data.discordAccountId}: ${data.discordNickName}`,
        );
        return;
      }
    }
  }

  /**
   * テスト用: メンバーを直接追加する
   */
  seedMember(member: InternalMember): void {
    this.members.set(member.id, member);
    if (member.discordId) {
      this.discordIdToMemberId.set(member.discordId, member.id);
    }
  }
}
