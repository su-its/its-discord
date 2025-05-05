import biRole, { biRoleKey } from "./implementations/bi";
import csRole, { csRoleKey } from "./implementations/cs";
import graduateRole, { graduateRoleKey } from "./implementations/graduate";
import iaRole, { iaRoleKey } from "./implementations/ia";
import obOgRole, { obOgRoleKey } from "./implementations/obog";
import othersRole, { othersRoleKey } from "./implementations/others";

export const departmentRoles = [
  csRole,
  biRole,
  iaRole,
  graduateRole,
  obOgRole,
  othersRole,
];

export const departmentRoleKeys = {
  csRoleKey,
  biRoleKey,
  iaRoleKey,
  graduateRoleKey,
  obOgRoleKey,
  othersRoleKey,
};
