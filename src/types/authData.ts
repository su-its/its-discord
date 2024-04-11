import Department from "../entities/department";
import Member from "../entities/member";

interface AuthData {
    name?: string,
    student_number?: string,
    department?: Department,
    mail?: string,
}

export default AuthData;