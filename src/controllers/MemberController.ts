import insertMember from "../usecases/insertMember";
import Member from "../entities/member";
import getAllMembers from "../usecases/getMembers";
import { getMembersByField } from "../usecases/getMembers";
import setDiscordId from "../usecases/setDiscordId";

export async function getMembers() {
  try {
    const members = await getAllMembers();
    return members;
  } catch (error) {
    console.error("Error getting members:", error);
  }
}

// Emailでメンバーを取得する 見つからなければundefinedを返す
export async function getMemberByEmail(email: string): Promise<Member | undefined> {
  try {
    const members = await getMembersByField("mail", email);
    const member = members[0];
    return member ? member : undefined;
  } catch (error) {
    console.error("Error getting member by email:", error);
  }
}

export async function getMemberByDiscordId(discordId: string): Promise<Member | undefined> {
  try {
    const members = await getMembersByField("discordId", discordId);
    const member = members[0];
    return member ? member : undefined;
  } catch (error) {
    console.error("Error getting member by discord id:", error);
  }
}

// memberにdiscordIdを追加する
export async function addDiscordId(member: Member, discordId: string): Promise<void> {
  try {
    await setDiscordId(member.id!, discordId);
  } catch (error) {
    console.error("Error adding discord id:", error);
  }
}

export async function addMember(memberData: Member): Promise<void> {
  try {
    await insertMember(memberData);
    console.log("Member successfully added");
  } catch (error) {
    console.error("Error adding member:", error);
  }
}
