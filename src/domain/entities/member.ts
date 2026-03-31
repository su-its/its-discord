import type department from "./department";

// TODO: v3 の Member モデルに合わせてリモデリングを検討する。
// - department を status + CompleteAffiliation ベースに変更
// - discordAccounts を配列に（1:N 対応）
// - status（active/unconfirmed/former）を明示的に持つ
interface Member {
  id: string;
  name: string;
  student_number?: string;
  department: department;
  mail: string;
  discordId?: string;
  discordNickname?: string;
}

export default Member;
