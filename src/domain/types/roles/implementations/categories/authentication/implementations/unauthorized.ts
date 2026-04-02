import type Role from "../../../../../role";
import buildRoleByCategory from "../../departments/utils/buildRoleByCategory";
import { AuthenticationRoleCategory } from "../authenticationRoleCategory";

const unauthorizedRole: Role = buildRoleByCategory({
  roleCategory: AuthenticationRoleCategory,
  role: {
    name: "未認証",
    color: "Grey",
    reason: "未認証メンバーロール",
  },
});
export default unauthorizedRole;
export const unauthorizedRoleKey = unauthorizedRole.name;
