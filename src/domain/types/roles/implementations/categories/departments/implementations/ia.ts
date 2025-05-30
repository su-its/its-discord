import type Role from "../../../../../role";
import { DepartmentRoleCategory } from "../departmentRoleCategory";
import buildRoleByCategory from "../utils/buildRoleByCategory";

const iaRole: Role = buildRoleByCategory({
  roleCategory: DepartmentRoleCategory,
  role: {
    name: "IA",
    color: [0, 128, 0],
    reason: "BI Department Role",
  },
});
export default iaRole;
export const iaRoleKey = iaRole.name;
