import type Role from "../../../../../role";
import { DepartmentRoleCategory } from "../departmentRoleCategory";
import buildRoleByCategory from "../utils/buildRoleByCategory";

const graduateRole: Role = buildRoleByCategory({
  roleCategory: DepartmentRoleCategory,
  role: {
    name: "大学院",
    color: [255, 215, 0],
    reason: "大学院ロール",
  },
});
export default graduateRole;
export const graduateRoleKey = graduateRole.name;
