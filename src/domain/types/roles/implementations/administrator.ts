import type Role from "../../role";
import { BOT_PREFIX } from "../constants";

const administratorRoleProperty: Role = {
  name: `${BOT_PREFIX}管理者`,
  color: "Red",
  reason: "Role for administrators.",
};

export default administratorRoleProperty;
export const administratorRoleKey = administratorRoleProperty.name;
