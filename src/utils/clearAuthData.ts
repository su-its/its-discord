import type AuthData from "../domain/types/authData";

function clearAuthData(): AuthData {
  return {
    name: undefined,
    student_number: undefined,
    department: undefined,
    mail: undefined,
    discordId: undefined,
  };
}

export default clearAuthData;
