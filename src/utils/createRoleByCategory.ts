import type Role from "../domain/types/role";
import type RoleCategory from "../domain/types/roleCategory";

interface BuildRoleProps {
  roleCategory: RoleCategory;
  role: Role;
}

/**
 * 指定された RoleCategory を利用して Role オブジェクトを構築する関数
 *
 * @param {RoleCategory} roleCategory - ロールカテゴリー
 * @param {Role} role - ロールオブジェクト
 * @returns 構築された Role オブジェクト
 */
function buildRoleByCategory({ roleCategory, role }: BuildRoleProps): Role {
  console.log(roleCategory);
  const fullName = `${roleCategory.prefix}${role.name}`;
  return {
    name: fullName,
    color: role.color,
    reason: role.reason,
  };
}

export default buildRoleByCategory;
