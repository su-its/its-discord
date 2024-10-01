import type department from "./department";

interface Member {
	id?: string;
	name: string;
	student_number: string;
	department: department;
	mail: string;
	discordId?: string;
}

export default Member;
