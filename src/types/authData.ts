import Department from "../entities/department";

interface AuthData {
  name?: string;
  student_number?: string;
  department?: Department;
  mail?: string;
  discordId?: string;
}

export default AuthData;
