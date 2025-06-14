import type {
  Department as ItsCoreDepartment,
  Member as ItsCoreMember,
} from "@shizuoka-its/core";
import InternalDepartment from "../../domain/entities/department";
import type InternalMember from "../../domain/entities/member";

export function toInternalMember(member: ItsCoreMember): InternalMember {
  const discordAccounts = member.getDiscordAccounts();
  const firstDiscordAccount = discordAccounts[0];

  return {
    id: member.id,
    name: member.getName(),
    student_number: member.getStudentId(),
    department: mapDepartment(member.getDepartment()),
    mail: member.getEmail().getValue(),
    discordId: firstDiscordAccount?.id,
    discordNickname: firstDiscordAccount?.getNickName(),
  };
}

function mapDepartment(department: ItsCoreDepartment): InternalDepartment {
  // 部署の値に基づいて適切な内部部署列挙型にマッピング
  const deptString = String(department.getValue()).toUpperCase();

  if (deptString.includes("CS")) return InternalDepartment.CS;
  if (deptString.includes("BI")) return InternalDepartment.BI;
  if (deptString.includes("IA")) return InternalDepartment.IA;
  if (deptString.includes("GRADUATE")) return InternalDepartment.GRADUATE;
  if (deptString.includes("ALUMNI")) return InternalDepartment.OBOG;
  if (deptString.includes("OTHERS")) return InternalDepartment.OTHERS;
  throw new Error(`Invalid department: ${department}`);
}

export function toInternalDepartment(
  department: ItsCoreDepartment,
): InternalDepartment {
  return mapDepartment(department);
}
