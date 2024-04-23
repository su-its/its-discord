import { getMemberByEmail } from "../controllers/MemberController";
import { auth } from "../infra/firebase";
import {
  ActionCodeSettings,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendSignInLinkToEmail,
} from "firebase/auth";
import setDiscordId from "./setDiscordId";

async function sendAuthMail(mail: string, student_number: string, department: string) {
  const actionCodeSettings: ActionCodeSettings = {
    url: "https://discord.com",
    handleCodeInApp: true,
  };

  try {
    const user = await createUserWithEmailAndPassword(auth, mail, student_number + department);
    await sendEmailVerification(user.user!, actionCodeSettings);

    console.log("Send mail to " + mail + " successfully");
  } catch (e) {
    console.error(e);
  }
}

export default sendAuthMail;
