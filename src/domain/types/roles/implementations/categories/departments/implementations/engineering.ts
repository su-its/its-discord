import type Role from "@domain/types/role";
import { DepartmentRoleCategory } from "@domain/types/roles/implementations/categories/departments/departmentRoleCategory";
import buildRoleByCategory from "@domain/types/roles/utils/buildRoleByCategory";

const engineeringRole: Role = buildRoleByCategory({
  roleCategory: DepartmentRoleCategory,
  role: {
    name: "工学部",
    color: [100, 100, 255],
    reason: "工学部ロール",
  },
});
export default engineeringRole;
export const engineeringRoleKey = engineeringRole.name;
