import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import Member from "../entities/member";
import { db } from "../infra/firebase";

const firestore = getFirestore();

async function getAllMembers(): Promise<Member[]> {
  const snapshot = await db.collection("members").get();
  const members: Member[] = snapshot.docs.map((doc) =>
    convertToMember({
      id: doc.id,
      ...doc.data(),
    })
  );
  return members;
}

async function getMembersByField(fieldName: string, value: string): Promise<Member[]> {
  const membersRef = collection(firestore, "members");
  const q = query(membersRef, where(fieldName, "==", value));
  const querySnapshot = await getDocs(q);
  
  const members: Member[] = querySnapshot.docs.map((doc) =>
    convertToMember({
      id: doc.id,
      ...doc.data(),
    })
  );
  return members;
}

function convertToMember(docData: FirebaseFirestore.DocumentData): Member {
  return {
    id: docData.id,
    name: docData.name,
    student_number: docData.student_number,
    department: docData.department,
    mail: docData.mail,
    discordId: docData.discordId,
  };
}

export default getAllMembers;
export { getMembersByField };
