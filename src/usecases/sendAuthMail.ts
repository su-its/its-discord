import { auth } from "../infra/firebase";
import {
	type ActionCodeSettings,
	createUserWithEmailAndPassword,
	sendEmailVerification,
} from "firebase/auth";

async function sendAuthMail(
	mail: string,
	student_number: string,
	department: string,
) {
	const actionCodeSettings: ActionCodeSettings = {
		url: "https://discord.com/channels/1224047445714010143/1224047445714010146",
		handleCodeInApp: true,
	};

	try {
		const user = await createUserWithEmailAndPassword(
			auth,
			mail,
			student_number + department,
		);
		await sendEmailVerification(user.user!, actionCodeSettings);

		console.log("Send mail to " + mail + " successfully");
	} catch (e) {
		console.error(e);
	}
}

export default sendAuthMail;
