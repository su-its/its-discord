import type { ColorResolvable, RoleCreateOptions } from "discord.js";

/**
 * ロールの型定義
 * Discord.jsのRoleCreateOptionsのname, color, reasonを必須フィールドに拡張
 * @extends RoleCreateOptions Discord.jsのロール作成オプション
 * @property {string} name ロールの名前
 * @property {ColorResolvable} color ロールの色
 * @property {string} reason ロールの作成理由
 */
export default interface Role extends RoleCreateOptions {
  name: string;
  color: ColorResolvable;
  reason: string;
}
