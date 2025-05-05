import type Role from "../../../../../role";
import { DepartmentRoleCategory } from "../departmentRoleCategory";
import buildRoleByCategory from "../utils/buildRoleByCategory";

const othersRole: Role = buildRoleByCategory({
  roleCategory: DepartmentRoleCategory,
  role: {
    name: "OTHERS",
    color: [128, 0, 128],
    reason: "Role for non informatics major students",
  },
});
export default othersRole;
export const othersRoleKey = othersRole.name;
