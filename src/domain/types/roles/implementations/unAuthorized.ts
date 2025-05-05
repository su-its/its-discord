import type Role from "../../role";

const unAuthorizedRoleProperty: Role = {
  name: "Unauthorized",
  color: "Grey",
  reason: "Unauthorized role for new members.",
};

export default unAuthorizedRoleProperty;
export const unAuthorizedRoleKey = unAuthorizedRoleProperty.name;
