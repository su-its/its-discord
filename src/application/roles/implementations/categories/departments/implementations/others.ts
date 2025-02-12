import type Role from "../../../../../../domain/types/role";
import buildRoleByCategory from "../../../../../../utils/createRoleByCategory";
import { DepartmentRoleCategory } from "../departmentRoleCategory";

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
