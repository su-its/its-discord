import type Department from "../entities/department";

// TODO: AuthDataとは何なのかしっかりモデリングしたほうが良さそう．なぜ全てoptionalなのかとかがドキュメント化されていると良い https://github.com/su-its/its-discord/issues/25
interface AuthData {
  name?: string;
  student_number?: string;
  department?: Department;
  mail?: string;
  discordId?: string;
}

export default AuthData;
