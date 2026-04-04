import type {
  AffiliationOption,
  ITSCorePort,
  MemberConnectionData,
  MemberNicknameUpdateData,
  MemberRegistrationData,
} from "../../application/ports/itsCorePort";
import type Affiliation from "../../domain/entities/affiliation";
import type Member from "../../domain/entities/member";
import type { ActiveMember } from "../../domain/entities/member";
import logger from "../logger";

const AFFILIATION_VALUES: readonly Affiliation[] = [
  "情報科学科",
  "行動情報学科",
  "情報社会学科",
  "工学部",
  "大学院",
  "その他",
] as const;

function toAffiliation(data: MemberRegistrationData): Affiliation {
  const values = Object.values(data.affiliationSelections);
  const match = AFFILIATION_VALUES.find((a) => values.includes(a));
  return match ?? "その他";
}

/**
 * ITSCorePort の in-memory 実装（ローカル検証用）
 * メンバーデータを Map で管理し、外部 DB に接続しない
 */
export class InMemoryITSCoreAdapter implements ITSCorePort {
  private members = new Map<string, Member>();
  private discordIdToMemberId = new Map<string, string>();
  private nextId = 1;

  getAllAffiliationOptions(): AffiliationOption[] {
    return AFFILIATION_VALUES.map((affiliation) => ({
      label: affiliation,
      courseType: "in-memory",
      selections: { affiliation },
      maxYear: 6,
    }));
  }

  async registerMember(data: MemberRegistrationData): Promise<void> {
    const id = `mem_${this.nextId++}`;
    const member: ActiveMember = {
      status: "active",
      id,
      name: data.name,
      studentId: data.studentId,
      affiliation: toAffiliation(data),
      universityEmail: data.email,
      discord: null,
    };
    this.members.set(id, member);
    logger.info(`[InMemory] Registered member: ${data.name} (${id})`);
  }

  async getMemberByDiscordId(discordId: string): Promise<Member | undefined> {
    const memberId = this.discordIdToMemberId.get(discordId);
    if (!memberId) return undefined;
    return this.members.get(memberId);
  }

  async getMemberByEmail(email: string): Promise<Member | undefined> {
    for (const member of this.members.values()) {
      if (member.universityEmail === email) return member;
    }
    return undefined;
  }

  async connectDiscordAccount(data: MemberConnectionData): Promise<void> {
    const member = this.members.get(data.memberId);
    if (!member) {
      throw new Error(`[InMemory] Member not found: ${data.memberId}`);
    }
    member.discord = { id: data.discordAccountId };
    this.discordIdToMemberId.set(data.discordAccountId, data.memberId);
    logger.info(
      `[InMemory] Connected Discord ${data.discordAccountId} to member ${data.memberId}`,
    );
  }

  async getMemberList(): Promise<Member[]> {
    return Array.from(this.members.values());
  }

  async updateMemberNickname(data: MemberNicknameUpdateData): Promise<void> {
    for (const member of this.members.values()) {
      if (member.discord?.id === data.discordAccountId) {
        member.discord = {
          ...member.discord,
          nickname: data.discordNickName,
        };
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
  seedMember(member: Member): void {
    this.members.set(member.id, member);
    if (member.discord) {
      this.discordIdToMemberId.set(member.discord.id, member.id);
    }
  }
}
