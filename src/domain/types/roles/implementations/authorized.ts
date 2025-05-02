import type Role from "../../role";

const authorizedRoleProperty: Role = {
  name: "Authorized",
  color: "Green",
  reason: "Member role for authenticated members.",
};

export default authorizedRoleProperty;
export const authorizedRoleKey = authorizedRoleProperty.name;
