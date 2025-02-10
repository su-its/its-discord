import type Department from "../../domain/entities/department";
import type Member from "../../domain/entities/member";

export type MemberCreateInput = {
  name: string;
  student_number: string;
  department: Department;
  mail: string;
};

export type MemberUpdateInput = {
  id: string;
  name?: string;
  student_number?: string;
  department?: Department;
  mail?: string;
};

export type ConnectDiscordAccountInput = {
  memberId: string;
  discordAccount: CreateDiscordAccountInput;
};

export type CreateDiscordAccountInput = {
  id: string;
  nickName: string;
};

/**
 * MemberテーブルとDiscordAccountテーブルを集約して扱う
 * メンバーリポジトリのインターフェース
 *  */
export interface IMemberRepository {
  /**
   * 全メンバーを取得する
   * @returns {Member[]} メンバーの配列
   */
  getAll(): Promise<Member[]>;
  /**
   * 指定されたIDのメンバーを取得する
   * @param {string} id メンバーID(coreの実装的にはmembersテーブルのID)
   * @returns {Member | null} メンバー、存在しない場合はnull
   */
  getById(id: string): Promise<Member | null>;
  /**
   * 指定されたDiscordIDのメンバーを取得する
   * @param {string} discordId DiscordID
   * @returns {Member | null} メンバー、存在しない場合はnull
   */
  getByDiscordId(discordId: string): Promise<Member | null>;
  /**
   * 指定されたメールアドレスのメンバーを取得する
   * @param {string} email メールアドレス
   * @returns {Member | null} メンバー、存在しない場合はnull
   */
  getByEmail(email: string): Promise<Member | null>;
  /**
   * メンバーを作成する
   * @param {MemberCreateInput} arg メンバー作成のための入力
   * @returns {Member} 作成されたメンバー
   */
  insert(arg: MemberCreateInput): Promise<Member>;
  /**
   * メンバーを更新する
   * @param {MemberUpdateInput} arg メンバー更新のための入力
   * @returns {Member} 更新されたメンバー
   */
  update(arg: MemberUpdateInput): Promise<Member>;
  /**
   * メンバーにDiscordアカウントを紐づける
   * @param {ConnectDiscordAccountInput} arg 紐づけるDiscordアカウント
   * @returns {Member} 更新されたメンバー
   * @throws {Error} メンバーが既にDiscordアカウントを持っている場合に発生 // TODO: 複数アカウントに対応する https://github.com/su-its/its-discord/issues/70
   */
  connectDiscordAccount(arg: ConnectDiscordAccountInput): Promise<Member>;
}
