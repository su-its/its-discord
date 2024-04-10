import department from "./department"

interface Member {
    id?: string,
    name: string,
    student_number: string,
    department: department
    mail: string,
}

export default Member;