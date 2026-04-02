import type Role from "../../../../../role";
import type RoleCategory from "../../../../../roleCategory";
import { BOT_PREFIX } from "../../../../constants";

interface BuildRoleByCategoryProps {
  roleCategory: RoleCategory;
  role: Role;
}

/**
 * 指定された RoleCategory を利用して Role オブジェクトを構築する関数
 * [ITS-BOT] + カテゴリプレフィックス + ロール名 の形式でロール名を生成する
 */
function buildRoleByCategory({
  roleCategory,
  role,
}: BuildRoleByCategoryProps): Role {
  const fullName = `${BOT_PREFIX}${roleCategory.prefix}${role.name}`;
  return {
    name: fullName,
    color: role.color,
    reason: role.reason,
  };
}

export default buildRoleByCategory;
