import {
  type ActionCodeSettings,
  type UserCredential,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../../infrastructure/firebase";

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
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      mail,
      student_number + department,
    );

    if (userCredential.user) {
      await sendEmailVerification(userCredential.user, actionCodeSettings);
      console.log(`Send mail to ${mail} successfully`);
    } else {
      console.error("User object is null after creation");
    }
  } catch (e) {
    console.error(e);
  }
}

export default sendAuthMail;
