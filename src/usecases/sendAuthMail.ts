import { auth } from "../infra/firebase";
import { ActionCodeSettings, sendSignInLinkToEmail } from "firebase/auth";

async function sendAuthMail(mail: string) {
    const actionCodeSettings: ActionCodeSettings = {
        url: "https://discord.com",
        handleCodeInApp: true,
    };

    try {
        await sendSignInLinkToEmail(auth, mail, actionCodeSettings);
        console.log("Send mail to " + mail + " successfully");
    } catch (e) {
        console.error(e);
    }
}

export default sendAuthMail;