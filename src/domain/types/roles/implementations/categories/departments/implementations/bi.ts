import type Role from "../../../../../role";
import { DepartmentRoleCategory } from "../departmentRoleCategory";
import buildRoleByCategory from "../utils/buildRoleByCategory";

const biRole: Role = buildRoleByCategory({
  roleCategory: DepartmentRoleCategory,
  role: {
    name: "BI",
    color: [0, 112, 255],
    reason: "BI Department Role",
  },
});
export default biRole;
export const biRoleKey = biRole.name;
