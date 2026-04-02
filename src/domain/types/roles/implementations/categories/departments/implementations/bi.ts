import type Role from "../../../../../role";
import { DepartmentRoleCategory } from "../departmentRoleCategory";
import buildRoleByCategory from "../utils/buildRoleByCategory";

const biRole: Role = buildRoleByCategory({
  roleCategory: DepartmentRoleCategory,
  role: {
    name: "行動情報学科",
    color: [0, 112, 255],
    reason: "行動情報学科ロール",
  },
});
export default biRole;
export const biRoleKey = biRole.name;
