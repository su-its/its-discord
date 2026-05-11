import type Role from "../../../../../role";
import buildRoleByCategory from "../../../../utils/buildRoleByCategory";
import { DepartmentRoleCategory } from "../departmentRoleCategory";

const othersRole: Role = buildRoleByCategory({
  roleCategory: DepartmentRoleCategory,
  role: {
    name: "その他",
    previousNames: ["DP:OTHERS"],
    color: [128, 0, 128],
    reason: "その他の所属ロール",
  },
});
export default othersRole;
export const othersRoleKey = othersRole.name;
