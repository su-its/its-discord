import type Role from "@domain/types/role";
import { AuthenticationRoleCategory } from "@domain/types/roles/implementations/categories/authentication/authenticationRoleCategory";
import buildRoleByCategory from "@domain/types/roles/utils/buildRoleByCategory";

const authorizedRole: Role = buildRoleByCategory({
  roleCategory: AuthenticationRoleCategory,
  role: {
    name: "認証済み",
    previousNames: ["Authorized"],
    color: "Green",
    reason: "認証済みメンバーロール",
  },
});
export default authorizedRole;
export const authorizedRoleKey = authorizedRole.name;
