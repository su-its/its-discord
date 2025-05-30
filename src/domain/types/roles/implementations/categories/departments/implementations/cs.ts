import type Role from "../../../../../role";
import { DepartmentRoleCategory } from "../departmentRoleCategory";
import buildRoleByCategory from "../utils/buildRoleByCategory";

const csRole: Role = buildRoleByCategory({
  roleCategory: DepartmentRoleCategory,
  role: {
    name: "CS",
    color: "Orange",
    reason: "CS Department Role",
  },
});
export default csRole;
export const csRoleKey = csRole.name;
