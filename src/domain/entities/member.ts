import type department from "./department";

// TODO: インラインドキュメント https://github.com/su-its/its-discord/issues/25
interface Member {
  id: string;
  name: string;
  student_number: string;
  department: department;
  mail: string;
  discordId?: string;
  discordNickname?: string;
}

export default Member;
