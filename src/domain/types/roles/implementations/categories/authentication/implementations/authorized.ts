import type Role from "../../../../../role";
import buildRoleByCategory from "../../departments/utils/buildRoleByCategory";
import { AuthenticationRoleCategory } from "../authenticationRoleCategory";

const authorizedRole: Role = buildRoleByCategory({
  roleCategory: AuthenticationRoleCategory,
  role: {
    name: "認証済み",
    color: "Green",
    reason: "認証済みメンバーロール",
  },
});
export default authorizedRole;
export const authorizedRoleKey = authorizedRole.name;
