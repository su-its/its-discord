import type Role from "@domain/types/role";
import { DepartmentRoleCategory } from "@domain/types/roles/implementations/categories/departments/departmentRoleCategory";
import buildRoleByCategory from "@domain/types/roles/utils/buildRoleByCategory";

const biRole: Role = buildRoleByCategory({
  roleCategory: DepartmentRoleCategory,
  role: {
    name: "行動情報学科",
    previousNames: ["DP:BI"],
    color: [0, 112, 255],
    reason: "行動情報学科ロール",
  },
});
export default biRole;
export const biRoleKey = biRole.name;
