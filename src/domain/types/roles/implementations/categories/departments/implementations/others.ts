import type Role from "@domain/types/role";
import { DepartmentRoleCategory } from "@domain/types/roles/implementations/categories/departments/departmentRoleCategory";
import buildRoleByCategory from "@domain/types/roles/utils/buildRoleByCategory";

const othersRole: Role = buildRoleByCategory({
  roleCategory: DepartmentRoleCategory,
  role: {
    name: "その他",
    previousNames: ["DP:OTHERS"],
    color: [128, 0, 128],
    reason: "その他の所属ロール",
  },
});
export default othersRole;
export const othersRoleKey = othersRole.name;
