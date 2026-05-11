import type Role from "../../../../../role";
import buildRoleByCategory from "../../../../utils/buildRoleByCategory";
import { AuthenticationRoleCategory } from "../authenticationRoleCategory";

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
