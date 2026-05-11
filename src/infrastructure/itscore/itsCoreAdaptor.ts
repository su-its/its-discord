import {
  type CompleteAffiliation,
  createMemberService,
  getAffiliationSteps,
  getMaxYear,
  UNIVERSITY_STRUCTURE,
} from "@shizuoka-its/core";
import type {
  AffiliationOption,
  ITSCorePort,
  MemberConnectionData,
  MemberNicknameUpdateData,
  MemberRegistrationData,
} from "../../application/ports/itsCorePort";
import type Member from "../../domain/entities/member";
import { memberWithDiscordToInternal, toMember } from "./mapper";

type CourseType = keyof typeof UNIVERSITY_STRUCTURE;
const SEPARATOR = " / ";

function enumerateAffiliations(): AffiliationOption[] {
  const entries: AffiliationOption[] = [];
  const courseTypes = Object.keys(UNIVERSITY_STRUCTURE) as CourseType[];

  for (const courseType of courseTypes) {
    const courseLabel = UNIVERSITY_STRUCTURE[courseType].label;
    recurse(courseType, courseLabel, {}, 0, entries);
  }

  return entries;
}

function recurse(
  courseType: CourseType,
  prefix: string,
  selections: Record<string, string>,
  depth: number,
  entries: AffiliationOption[],
): void {
  const steps = getAffiliationSteps(courseType, selections);
  const currentStep = steps[depth];

  if (!currentStep) {
    entries.push({
      label: prefix,
      courseType,
      selections,
      maxYear: getMaxYear(courseType),
    });
    return;
  }

  for (const option of currentStep.options) {
    const newSelections = { ...selections, [currentStep.field]: option };
    recurse(
      courseType,
      `${prefix}${SEPARATOR}${option}`,
      newSelections,
      depth + 1,
      entries,
    );
  }
}

/**
 * ITSCoreのメンバー機能へのアクセスを提供するAdapter（ヘキサゴナルアーキテクチャ）
 * v3のMemberService facadeを使用
 */
export class ITSCoreAdaptor implements ITSCorePort {
  private service = createMemberService();
  private affiliationOptions = enumerateAffiliations();

  getAllAffiliationOptions(): AffiliationOption[] {
    return this.affiliationOptions;
  }

  async registerMember(data: MemberRegistrationData): Promise<void> {
    const affiliation: CompleteAffiliation = {
      type: data.courseType,
      value: { ...data.affiliationSelections, year: data.year },
    } as CompleteAffiliation;

    await this.service.register({
      name: data.name,
      studentId: data.studentId,
      email: data.email,
      affiliation,
    });
  }

  async getMemberByDiscordId(discordId: string): Promise<Member | undefined> {
    const result = await this.service.getByDiscordId(discordId);
    return result.member ? toMember(result.member, { discordId }) : undefined;
  }

  async getMemberByEmail(email: string): Promise<Member | undefined> {
    const result = await this.service.getByEmail(email);
    if (!result.member) return undefined;

    // discord 紐付け情報を含めて返す
    const withDiscord = await this.service.getMemberWithDiscordAccounts(
      result.member.id,
    );
    return withDiscord.member
      ? memberWithDiscordToInternal(withDiscord.member)
      : toMember(result.member);
  }

  async connectDiscordAccount(data: MemberConnectionData): Promise<void> {
    await this.service.connectDiscordAccount({
      memberId: data.memberId,
      discordAccountId: data.discordAccountId,
    });
  }

  async getMemberList(): Promise<Member[]> {
    const result = await this.service.listMembersWithDiscordAccounts();
    return result.entries.map(memberWithDiscordToInternal);
  }

  async updateMemberNickname(data: MemberNicknameUpdateData): Promise<void> {
    await this.service.changeDiscordNickName({
      discordAccountId: data.discordAccountId,
      discordNickName: data.discordNickName,
    });
  }
}
