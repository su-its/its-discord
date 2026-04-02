import biRole, { biRoleKey } from "./implementations/bi";
import csRole, { csRoleKey } from "./implementations/cs";
import engineeringRole, {
  engineeringRoleKey,
} from "./implementations/engineering";
import graduateRole, { graduateRoleKey } from "./implementations/graduate";
import iaRole, { iaRoleKey } from "./implementations/ia";
import othersRole, { othersRoleKey } from "./implementations/others";

export const departmentRoles = [
  csRole,
  biRole,
  iaRole,
  graduateRole,
  engineeringRole,
  othersRole,
];

export const departmentRoleKeys = {
  csRoleKey,
  biRoleKey,
  iaRoleKey,
  graduateRoleKey,
  engineeringRoleKey,
  othersRoleKey,
};
