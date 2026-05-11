import type Role from "@domain/types/role";
import { DepartmentRoleCategory } from "@domain/types/roles/implementations/categories/departments/departmentRoleCategory";
import buildRoleByCategory from "@domain/types/roles/utils/buildRoleByCategory";

const graduateRole: Role = buildRoleByCategory({
  roleCategory: DepartmentRoleCategory,
  role: {
    name: "大学院",
    previousNames: ["DP:GRADUATE"],
    color: [255, 215, 0],
    reason: "大学院ロール",
  },
});
export default graduateRole;
export const graduateRoleKey = graduateRole.name;
