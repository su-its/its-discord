import type Role from "@domain/types/role";
import { DepartmentRoleCategory } from "@domain/types/roles/implementations/categories/departments/departmentRoleCategory";
import buildRoleByCategory from "@domain/types/roles/utils/buildRoleByCategory";

const iaRole: Role = buildRoleByCategory({
  roleCategory: DepartmentRoleCategory,
  role: {
    name: "情報社会学科",
    previousNames: ["DP:IA"],
    color: [0, 128, 0],
    reason: "情報社会学科ロール",
  },
});
export default iaRole;
export const iaRoleKey = iaRole.name;
