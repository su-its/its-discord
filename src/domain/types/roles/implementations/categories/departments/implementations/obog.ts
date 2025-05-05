import type Role from "../../../../../role";
import { DepartmentRoleCategory } from "../departmentRoleCategory";
import buildRoleByCategory from "../utils/buildRoleByCategory";

const obOgRole: Role = buildRoleByCategory({
  roleCategory: DepartmentRoleCategory,
  role: {
    name: "OB/OG",
    color: [0, 128, 128],
    reason: "Role for OB/OG",
  },
});
export default obOgRole;
export const obOgRoleKey = obOgRole.name;
