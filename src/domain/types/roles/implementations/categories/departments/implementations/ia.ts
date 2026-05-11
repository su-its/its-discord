import type Role from "../../../../../role";
import buildRoleByCategory from "../../../../utils/buildRoleByCategory";
import { DepartmentRoleCategory } from "../departmentRoleCategory";

const iaRole: Role = buildRoleByCategory({
  roleCategory: DepartmentRoleCategory,
  role: {
    name: "情報社会学科",
    previousNames: ["DP:IA"],
    color: [0, 128, 0],
    reason: "情報社会学科ロール",
  },
});
export default iaRole;
export const iaRoleKey = iaRole.name;
