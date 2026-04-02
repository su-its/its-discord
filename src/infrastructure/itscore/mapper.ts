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
    department: statusToDepartment(member),
    mail: member.email.getValue(),
    discordId: discordInfo?.discordId,
    discordNickname: discordInfo?.discordNickname,
  };
}

type HasStatusAndAffiliation =
  | { status: "former" }
  | { status: "unconfirmed" }
  | { status: "active"; affiliation: CompleteAffiliation };

function statusToDepartment(
  member: HasStatusAndAffiliation,
): InternalDepartment {
  if (member.status === "former") return InternalDepartment.OBOG;
  // TODO: unconfirmed には専用の Unconfirmed ロールを付与する。
  // 次PRで Department enum を status ベースに見直し、ロール付与ロジックも変更する。
  if (member.status === "unconfirmed") return InternalDepartment.OTHERS;

  const { affiliation } = member;
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

  // TODO: 工学部など情報学部以外の学部ロールにも対応する
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
    department: statusToDepartment(entry),
    mail: entry.email,
    discordId: firstAccount?.discordId,
    discordNickname: firstAccount?.nickName,
  };
}
