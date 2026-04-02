import type Role from "../../../../../role";
import { DepartmentRoleCategory } from "../departmentRoleCategory";
import buildRoleByCategory from "../utils/buildRoleByCategory";

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
