import type Role from "../../../../../role";
import buildRoleByCategory from "../../departments/utils/buildRoleByCategory";
import { AuthenticationRoleCategory } from "../authenticationRoleCategory";

const unconfirmedRole: Role = buildRoleByCategory({
  roleCategory: AuthenticationRoleCategory,
  role: {
    name: "確認中",
    color: "Yellow",
    reason: "メール認証確認中ロール",
  },
});
export default unconfirmedRole;
export const unconfirmedRoleKey = unconfirmedRole.name;
