import type Member from "../entities/member";
import getMembers from "../usecases/getMembers";
import insertMember from "../usecases/insertMember";
import setDiscordId from "../usecases/setDiscordId";

export async function getAllMembers(): Promise<Member[] | undefined> {
	try {
		return await getMembers();
	} catch (error) {
		console.error("Error getting members:", error);
		return undefined;
	}
}

export async function getMemberByEmail(
	email: string,
): Promise<Member | undefined> {
	try {
		const members = await getMembers();
		return members.find((m) => m.mail === email);
	} catch (error) {
		console.error("Error getting member by email:", error);
		return undefined;
	}
}

export async function getMemberByDiscordId(
	discordId: string,
): Promise<Member | undefined> {
	try {
		const members = await getMembers();
		return members.find((m) => m.discordId === discordId);
	} catch (error) {
		console.error("Error getting member by discord id:", error);
		return undefined;
	}
}

export async function addDiscordId(
	member: Member,
	discordId: string,
): Promise<boolean> {
	if (!member.id) {
		console.error("Member ID is undefined");
		return false;
	}

	try {
		await setDiscordId(member.id, discordId);
		return true;
	} catch (error) {
		console.error("Error adding discord id:", error);
		return false;
	}
}

export async function addMember(memberData: Member): Promise<boolean> {
	try {
		await insertMember(memberData);
		console.log("Member successfully added");
		return true;
	} catch (error) {
		console.error("Error adding member:", error);
		return false;
	}
}
