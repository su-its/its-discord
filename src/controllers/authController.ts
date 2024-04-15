import sendAuthMail from "../usecases/sendAuthMail";

async function sendAuthMailController(mail: string) {
    try {
        await sendAuthMail(mail);
    } catch (e) {
        console.error(e);
    }
}

export default sendAuthMailController;
