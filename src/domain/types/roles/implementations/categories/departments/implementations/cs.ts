import type Role from "@domain/types/role";
import { DepartmentRoleCategory } from "@domain/types/roles/implementations/categories/departments/departmentRoleCategory";
import buildRoleByCategory from "@domain/types/roles/utils/buildRoleByCategory";

const csRole: Role = buildRoleByCategory({
  roleCategory: DepartmentRoleCategory,
  role: {
    name: "情報科学科",
    previousNames: ["DP:CS"],
    color: "Orange",
    reason: "情報科学科ロール",
  },
});
export default csRole;
export const csRoleKey = csRole.name;
