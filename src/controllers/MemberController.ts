import insertMember from '../usecases/insertMember';
import Member from '../entities/member';
import getMembers from '../usecases/getMembers';

export async function addNewMember(memberData: Member): Promise<void> {
    try {
        await insertMember(memberData);
        console.log('Member successfully added');
    } catch (error) {
        console.error('Error adding new member:', error);
    }
}

export async function getAllMembers() {
    try {
        const members = await getMembers();
        return members;
    } catch (error) {
        console.error('Error getting members:', error);
    }
}