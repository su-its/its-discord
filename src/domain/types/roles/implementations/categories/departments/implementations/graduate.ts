import type Role from "../../../../../role";
import { DepartmentRoleCategory } from "../departmentRoleCategory";
import buildRoleByCategory from "../utils/buildRoleByCategory";

const graduateRole: Role = buildRoleByCategory({
  roleCategory: DepartmentRoleCategory,
  role: {
    name: "GRADUATE",
    color: [255, 215, 0],
    reason: "Graduate student Role",
  },
});
export default graduateRole;
export const graduateRoleKey = graduateRole.name;
