import type Department from "../entities/department";

/**
 * メンバー認証に必要な完全な情報を表す型
 * すべてのフィールドが必須となっている
 */
export interface MemberCredentials {
  name: string;
  student_number: string;
  department: Department;
  mail: string;
  discordId: string;
}