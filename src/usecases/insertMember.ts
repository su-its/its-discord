import { v4 as uuidv4 } from "uuid";
import type Member from "../entities/member";
import { db } from "../infra/firebase";

async function insertMember(member: Member) {
  const uniqueId = uuidv4();
  const docRef = await db.collection("members").doc(uniqueId);
  await docRef.set({
    name: member.name,
    student_number: member.student_number,
    department: member.department,
    mail: member.mail,
  });
  console.log("Document written with ID: ", docRef.id);
}

export default insertMember;
