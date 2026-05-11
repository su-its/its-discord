import type Role from "../../../../../role";
import buildRoleByCategory from "../../../../utils/buildRoleByCategory";
import { DepartmentRoleCategory } from "../departmentRoleCategory";

const biRole: Role = buildRoleByCategory({
  roleCategory: DepartmentRoleCategory,
  role: {
    name: "行動情報学科",
    previousNames: ["DP:BI"],
    color: [0, 112, 255],
    reason: "行動情報学科ロール",
  },
});
export default biRole;
export const biRoleKey = biRole.name;
