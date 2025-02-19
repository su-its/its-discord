import {
  type ActionCodeSettings,
  type UserCredential,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../../infrastructure/firebase";
import logger from "../../infrastructure/logger";

async function sendAuthMail(
  mail: string,
  student_number: string,
  department: string,
) {
  const actionCodeSettings: ActionCodeSettings = {
    url: "https://discord.com/channels/1224047445714010143/1224047445714010146",
    handleCodeInApp: true,
  };

  const userCredential: UserCredential = await createUserWithEmailAndPassword(
    auth,
    mail,
    student_number + department,
  );

  if (!userCredential.user) {
    throw new Error("User object is null after creation");
  }

  await sendEmailVerification(userCredential.user, actionCodeSettings);
  logger.info(`Send mail to ${mail} successfully`);
}

export default sendAuthMail;
