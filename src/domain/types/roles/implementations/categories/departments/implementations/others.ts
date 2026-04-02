import type Role from "../../../../../role";
import { DepartmentRoleCategory } from "../departmentRoleCategory";
import buildRoleByCategory from "../utils/buildRoleByCategory";

const othersRole: Role = buildRoleByCategory({
  roleCategory: DepartmentRoleCategory,
  role: {
    name: "その他",
    color: [128, 0, 128],
    reason: "その他の所属ロール",
  },
});
export default othersRole;
export const othersRoleKey = othersRole.name;
