import Member from "../entities/member";
import { db } from "../infra/firebase";

async function getMembers(): Promise<Member[]> {
    const snapshot = await db.collection('members').get();
    const members: Member[] = snapshot.docs.map(doc => convertToMember({
        id: doc.id,
        ...doc.data()
    }));
    return members;
}

function convertToMember(docData: FirebaseFirestore.DocumentData): Member {
    return {
        id: docData.id,
        name: docData.name,
        student_number: docData.student_number,
        department: docData.department,
        mail: docData.mail,
    };
};

export default getMembers;