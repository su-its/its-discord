import type Role from "../../../../../../domain/types/role";
import buildRoleByCategory from "../../../../../../utils/createRoleByCategory";
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
