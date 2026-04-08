import type {
  CompleteAffiliation,
  Member as ItsCoreMember,
  MemberWithDiscordAccounts,
} from "@shizuoka-its/core";
import type Affiliation from "../../domain/entities/affiliation";
import type Member from "../../domain/entities/member";
import type { DiscordAccount } from "../../domain/entities/member";

interface DiscordInfo {
  discordId?: string;
  discordNickname?: string;
}

function toDiscordAccount(info?: DiscordInfo): DiscordAccount | null {
  if (!info?.discordId) return null;
  return { id: info.discordId, nickname: info.discordNickname };
}

export function toMember(
  member: ItsCoreMember,
  discordInfo?: DiscordInfo,
): Member {
  const discord = toDiscordAccount(discordInfo);

  if (member.status === "former") {
    return {
      status: "former",
      id: member.id,
      name: member.name,
      universityEmail: member.email.getValue(),
      discord,
    };
  }

  if (member.status === "unconfirmed") {
    return {
      status: "unconfirmed",
      id: member.id,
      name: member.name,
      universityEmail: member.email.getValue(),
      discord,
    };
  }

  return {
    status: "active",
    id: member.id,
    name: member.name,
    universityEmail: member.email.getValue(),
    studentId: member.studentId.getValue(),
    affiliation: completeAffiliationToAffiliation(member.affiliation),
    discord,
  };
}

function completeAffiliationToAffiliation(
  affiliation: CompleteAffiliation,
): Affiliation {
  if (affiliation.type !== "undergraduate") return "大学院";

  const value = affiliation.value;
  if ("faculty" in value) {
    const faculty = value.faculty as string;
    if (faculty === "情報学部" && "department" in value) {
      const dept = value.department as string;
      if (dept === "情報科学科") return "情報科学科";
      if (dept === "行動情報学科") return "行動情報学科";
      if (dept === "情報社会学科") return "情報社会学科";
    }
    if (faculty === "工学部") return "工学部";
  }

  return "その他";
}

export function memberWithDiscordToInternal(
  entry: MemberWithDiscordAccounts,
): Member {
  const firstAccount = entry.discordAccounts[0];
  const discord: DiscordAccount | null = firstAccount
    ? { id: firstAccount.discordId, nickname: firstAccount.nickName }
    : null;

  if (entry.status === "former") {
    return {
      status: "former",
      id: entry.id,
      name: entry.name,
      universityEmail: entry.email,
      discord,
    };
  }

  if (entry.status === "unconfirmed") {
    return {
      status: "unconfirmed",
      id: entry.id,
      name: entry.name,
      universityEmail: entry.email,
      discord,
    };
  }

  return {
    status: "active",
    id: entry.id,
    name: entry.name,
    universityEmail: entry.email,
    studentId: entry.studentId ?? "",
    affiliation: completeAffiliationToAffiliation(entry.affiliation),
    discord,
  };
}
