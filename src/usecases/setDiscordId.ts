
import Member from "../entities/member";
import { db } from "../infra/firebase";

async function setDiscordId(memberId: string, discordId: string) {
    const docRef = db.collection('members').doc(memberId);
    await docRef.update({
        discordId: discordId,
    });
};

export default setDiscordId;