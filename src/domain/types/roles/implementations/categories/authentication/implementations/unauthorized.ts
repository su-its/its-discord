import type Role from "@domain/types/role";
import { AuthenticationRoleCategory } from "@domain/types/roles/implementations/categories/authentication/authenticationRoleCategory";
import buildRoleByCategory from "@domain/types/roles/utils/buildRoleByCategory";

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
