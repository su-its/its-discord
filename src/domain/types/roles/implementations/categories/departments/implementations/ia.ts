import type Role from "../../../../../role";
import buildRoleByCategory from "../utils/buildRoleByCategory";
import { DepartmentRoleCategory } from "../departmentRoleCategory";

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
