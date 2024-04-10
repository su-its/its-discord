import Member from "../entities/member";
import { v4 as uuidv4 } from 'uuid';
import initializeFirestore from "./initFirestore";

async function insertMember(member: Member) {
    const db: FirebaseFirestore.Firestore = initializeFirestore();
    const uniqueId = uuidv4();
    const docRef = db.collection('members').doc(uniqueId);
    await docRef.set({
        name: member.name,
        student_number: member.student_number,
        department: member.department,
        mail: member.mail,
    });
};

export default insertMember;