import type Role from "../../../../../../domain/types/role";
import buildRoleByCategory from "../../../../../../utils/createRoleByCategory";
import { DepartmentRoleCategory } from "../departmentRoleCategory";

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
