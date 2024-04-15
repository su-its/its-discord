import AuthData from "../types/authData";
import sendAuthMail from "../usecases/sendAuthMail";

async function sendAuthMailController(userInfo: AuthData) {
    try {
        await sendAuthMail(userInfo.mail!, userInfo.student_number!, userInfo.department!);
    } catch (e) {
        console.error(e);
    }
}

export default sendAuthMailController;
