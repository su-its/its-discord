import type Role from "../../../../../role";
import buildRoleByCategory from "../../../../utils/buildRoleByCategory";
import { DepartmentRoleCategory } from "../departmentRoleCategory";

const csRole: Role = buildRoleByCategory({
  roleCategory: DepartmentRoleCategory,
  role: {
    name: "情報科学科",
    previousNames: ["DP:CS"],
    color: "Orange",
    reason: "情報科学科ロール",
  },
});
export default csRole;
export const csRoleKey = csRole.name;
