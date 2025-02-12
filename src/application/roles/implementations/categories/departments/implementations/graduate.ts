import type Role from "../../../../../../domain/types/role";
import buildRoleByCategory from "../../../../../../utils/createRoleByCategory";
import { DepartmentRoleCategory } from "../departmentRoleCategory";

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
