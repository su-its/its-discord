import Department from "../entities/department";

interface AuthData {
    name?: string,
    student_number?: string,
    department?: Department,
    mail?: string,
    discordId?: string,
}

// class AuthData {
//     private name?: string;
//     private student_number?: string;
//     private department?: Department;
//     private mail?: string;
//     private discordId?: string;

//     constructor(name?: string, student_number?: string, department?: Department, mail?: string, discordId?: string) {
//         this.name = name;
//         this.student_number = student_number;
//         this.department = department;
//         this.mail = mail;
//         this.discordId = discordId;
//     }

//     getName(): string | undefined {
//         return this.name;
//     }

//     getStudentNumber(): string | undefined {
//         return this.student_number;
//     }

//     getDepartment(): Department | undefined {
//         return this.department;
//     }

//     getMail(): string | undefined {
//         return this.mail;
//     }

//     clear(): void {
//         this.name = undefined;
//         this.student_number = undefined;
//         this.department = undefined;
//         this.mail = undefined;
//     }

//     isComplete(): boolean {
//         return this.name !== undefined && this.student_number !== undefined && this.department !== undefined && this.mail !== undefined;
//     }
// }

export default AuthData;