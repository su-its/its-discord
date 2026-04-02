import type Role from "../../../../../role";
import { DepartmentRoleCategory } from "../departmentRoleCategory";
import buildRoleByCategory from "../utils/buildRoleByCategory";

const iaRole: Role = buildRoleByCategory({
  roleCategory: DepartmentRoleCategory,
  role: {
    name: "情報社会学科",
    color: [0, 128, 0],
    reason: "情報社会学科ロール",
  },
});
export default iaRole;
export const iaRoleKey = iaRole.name;
