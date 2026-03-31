import type {
  CompleteAffiliation,
  Member as ItsCoreMember,
  MemberWithDiscordAccounts,
} from "@shizuoka-its/core";
import InternalDepartment from "../../domain/entities/department";
import type InternalMember from "../../domain/entities/member";

interface DiscordInfo {
  discordId?: string;
  discordNickname?: string;
}

export function toInternalMember(
  member: ItsCoreMember,
  discordInfo?: DiscordInfo,
): InternalMember {
  return {
    id: member.id,
    name: member.name,
    student_number:
      member.status === "active" ? String(member.studentId) : undefined,
    department: mapAffiliationToDepartment(member),
    mail: member.email.getValue(),
    discordId: discordInfo?.discordId,
    discordNickname: discordInfo?.discordNickname,
  };
}

function mapAffiliationToDepartment(member: ItsCoreMember): InternalDepartment {
  if (member.status === "former") return InternalDepartment.OBOG;
  // TODO: unconfirmed には専用の Unconfirmed ロールを付与する。
  // 次PRで Department enum を status ベースに見直し、ロール付与ロジックも変更する。
  if (member.status === "unconfirmed") return InternalDepartment.OTHERS;

  const affiliation = member.affiliation;
  if (affiliation.type !== "undergraduate") return InternalDepartment.GRADUATE;

  const value = affiliation.value;
  if (
    "faculty" in value &&
    value.faculty === "情報学部" &&
    "department" in value
  ) {
    const dept = value.department as string;
    if (dept === "情報科学科") return InternalDepartment.CS;
    if (dept === "行動情報学科") return InternalDepartment.BI;
    if (dept === "情報社会学科") return InternalDepartment.IA;
  }

  return InternalDepartment.OTHERS;
}

export function memberWithDiscordToInternal(
  entry: MemberWithDiscordAccounts,
): InternalMember {
  const firstAccount = entry.discordAccounts[0];
  return {
    id: entry.id,
    name: entry.name,
    student_number: entry.status === "active" ? entry.studentId : undefined,
    department: mapDTOToDepartment(entry),
    mail: entry.email,
    discordId: firstAccount?.discordId,
    discordNickname: firstAccount?.nickName,
  };
}

function mapDTOToDepartment(
  dto: MemberWithDiscordAccounts,
): InternalDepartment {
  if (dto.status === "former") return InternalDepartment.OBOG;
  if (dto.status === "unconfirmed") return InternalDepartment.OTHERS;

  const { affiliation } = dto;
  if (affiliation.type !== "undergraduate") return InternalDepartment.GRADUATE;

  const value = affiliation.value;
  if (
    "faculty" in value &&
    value.faculty === "情報学部" &&
    "department" in value
  ) {
    const dept = value.department as string;
    if (dept === "情報科学科") return InternalDepartment.CS;
    if (dept === "行動情報学科") return InternalDepartment.BI;
    if (dept === "情報社会学科") return InternalDepartment.IA;
  }

  return InternalDepartment.OTHERS;
}

// TODO: 暫定マッピング。次PRで getAffiliationSteps() ベースの UI に置き換え、
// year ハードコードを解消し、OBOG/OTHERS の登録にも対応する。
const DEPARTMENT_AFFILIATION_MAP: Record<string, CompleteAffiliation> = {
  [InternalDepartment.CS]: {
    type: "undergraduate",
    value: { faculty: "情報学部", department: "情報科学科", year: 1 },
  },
  [InternalDepartment.BI]: {
    type: "undergraduate",
    value: { faculty: "情報学部", department: "行動情報学科", year: 1 },
  },
  [InternalDepartment.IA]: {
    type: "undergraduate",
    value: { faculty: "情報学部", department: "情報社会学科", year: 1 },
  },
  [InternalDepartment.GRADUATE]: {
    type: "master",
    value: {
      school: "総合科学技術研究科",
      major: "情報学専攻",
      course: "基盤情報学コース",
      year: 1,
    },
  },
};

export function departmentToAffiliation(
  department: string,
): CompleteAffiliation {
  const affiliation = DEPARTMENT_AFFILIATION_MAP[department];
  if (!affiliation) {
    throw new Error(
      `Cannot convert department "${department}" to affiliation. Only CS, BI, IA, GRADUATE are supported for registration.`,
    );
  }
  return affiliation;
}
