import type Role from "../../../../../role";
import { DepartmentRoleCategory } from "../departmentRoleCategory";
import buildRoleByCategory from "../utils/buildRoleByCategory";

const csRole: Role = buildRoleByCategory({
  roleCategory: DepartmentRoleCategory,
  role: {
    name: "情報科学科",
    color: "Orange",
    reason: "情報科学科ロール",
  },
});
export default csRole;
export const csRoleKey = csRole.name;
