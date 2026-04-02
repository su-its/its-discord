import type Role from "../../../../../role";
import buildRoleByCategory from "../../departments/utils/buildRoleByCategory";
import { AuthenticationRoleCategory } from "../authenticationRoleCategory";

const unauthorizedRole: Role = buildRoleByCategory({
  roleCategory: AuthenticationRoleCategory,
  role: {
    name: "メール未認証",
    previousNames: ["Unauthorized"],
    color: "Grey",
    reason: "メール未認証メンバーロール",
  },
});
export default unauthorizedRole;
export const unauthorizedRoleKey = unauthorizedRole.name;
