import type Role from "../../../../../../domain/types/role";
import buildRoleByCategory from "../../../../../utils/createRoleByCategory";
import { DepartmentRoleCategory } from "../departmentRoleCategory";

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
