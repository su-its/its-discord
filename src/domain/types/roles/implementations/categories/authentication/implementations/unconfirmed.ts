import type Role from "@domain/types/role";
import { AuthenticationRoleCategory } from "@domain/types/roles/implementations/categories/authentication/authenticationRoleCategory";
import buildRoleByCategory from "@domain/types/roles/utils/buildRoleByCategory";

const unconfirmedRole: Role = buildRoleByCategory({
  roleCategory: AuthenticationRoleCategory,
  role: {
    name: "室員情報未確認",
    color: "Yellow",
    reason: "室員情報未確認ロール",
  },
});
export default unconfirmedRole;
export const unconfirmedRoleKey = unconfirmedRole.name;
