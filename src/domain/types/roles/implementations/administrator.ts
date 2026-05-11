import type Role from "@domain/types/role";
import { BOT_PREFIX } from "@domain/types/roles/constants";

const administratorRoleProperty: Role = {
  name: `${BOT_PREFIX}管理者`,
  previousNames: ["Administrator"],
  color: "Red",
  reason: "Role for administrators.",
};

export default administratorRoleProperty;
export const administratorRoleKey = administratorRoleProperty.name;
