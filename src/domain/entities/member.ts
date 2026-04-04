import type Affiliation from "./affiliation";

export interface DiscordAccount {
  id: string;
  nickname?: string;
}

interface MemberBase {
  id: string;
  name: string;
  universityEmail: string;
  discord: DiscordAccount | null;
}

export interface ActiveMember extends MemberBase {
  status: "active";
  studentId: string;
  affiliation: Affiliation;
}

export interface UnconfirmedMember extends MemberBase {
  status: "unconfirmed";
}

export interface FormerMember extends MemberBase {
  status: "former";
}

type Member = ActiveMember | UnconfirmedMember | FormerMember;

export default Member;
