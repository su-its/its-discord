import type AuthData from "../types/authData";
import sendAuthMail from "../usecases/sendAuthMail";
import { getMemberByEmail } from "./MemberController";
import setDiscordId from "../usecases/setDiscordId";
import type Member from "../entities/member";

async function sendAuthMailController(userInfo: AuthData) {
	try {
		if (!checkAuthData(userInfo)) {
			throw new Error("Invalid AuthData");
		}

		const { mail, student_number, department, discordId } = userInfo;

		if (!mail || !student_number || !department || !discordId) {
			throw new Error("Missing required fields in AuthData");
		}

		await sendAuthMail(mail, student_number, department);

		const member = await getMemberByEmail(mail);

		if (!member) {
			throw new Error("Member not found");
		}

		checkMember(member);

		if (!member.id) {
			throw new Error("Member ID is missing");
		}

		await setDiscordId(member.id, discordId);
	} catch (e) {
		console.error(e);
		throw e; // エラーを上位に伝播させる
	}
}

function checkAuthData(userInfo: AuthData): boolean {
	return (
		userInfo.mail !== undefined &&
		userInfo.student_number !== undefined &&
		userInfo.department !== undefined &&
		userInfo.discordId !== undefined
	);
}

function checkMember(member: Member | undefined): void {
	if (!member) {
		throw new Error("Member not found");
	}
	if (!member.id) {
		throw new Error("Member id is not provided");
	}
}

export default sendAuthMailController;
