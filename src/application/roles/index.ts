import RoleRegistry from "./core/roleRegistry";
import administratorRole from "./implementations/administrator";
import authorizedRole from "./implementations/authorized";
import {
  departmentRoleKeys,
  departmentRoles,
} from "./implementations/categories/departments";
import unAuthorizedRole from "./implementations/unAuthorized";

const roleRegistry = new RoleRegistry();

// 管理者ロール
roleRegistry.register(administratorRole);
// 認証済みルール
roleRegistry.register(authorizedRole);
// 未認証ロール
roleRegistry.register(unAuthorizedRole);
// 学部カテゴリのロール
roleRegistry.registerRoles(departmentRoles);

export const roleRegistryKeys = {
  administratorRoleKey: administratorRole.name,
  authorizedRoleKey: authorizedRole.name,
  unAuthorizedRoleKey: unAuthorizedRole.name,
  ...departmentRoleKeys,
};

export default roleRegistry;
