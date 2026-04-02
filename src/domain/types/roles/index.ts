import RoleRegistry from "./core/roleRegistry";
import administratorRole from "./implementations/administrator";
import {
  authenticationRoleKeys,
  authenticationRoles,
} from "./implementations/categories/authentication";
import {
  departmentRoleKeys,
  departmentRoles,
} from "./implementations/categories/departments";
import formerMemberRole, {
  formerMemberRoleKey,
} from "./implementations/formerMember";

const roleRegistry = new RoleRegistry();

// 管理者ロール
roleRegistry.register(administratorRole);
// 旧室員ロール
roleRegistry.register(formerMemberRole);
// 認証カテゴリのロール
roleRegistry.registerRoles(authenticationRoles);
// 所属カテゴリのロール
roleRegistry.registerRoles(departmentRoles);

export const roleRegistryKeys = {
  administratorRoleKey: administratorRole.name,
  formerMemberRoleKey,
  ...authenticationRoleKeys,
  ...departmentRoleKeys,
};

export default roleRegistry;
