import type {
  CompleteAffiliation,
  Member as ItsCoreMember,
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
    student_number: member.status === "active" ? String(member.studentId) : "",
    department: mapAffiliationToDepartment(member),
    mail: member.email.getValue(),
    discordId: discordInfo?.discordId,
    discordNickname: discordInfo?.discordNickname,
  };
}

function mapAffiliationToDepartment(member: ItsCoreMember): InternalDepartment {
  if (member.status === "former") return InternalDepartment.OBOG;
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
