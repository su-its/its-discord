import type Role from "../../../domain/types/role";

const unAuthorizedRoleProperty: Role = {
  name: "Unauthorized",
  color: "Grey",
  reason: "Unauthorized role for new members.",
};

export default unAuthorizedRoleProperty;
export const unAuthorizedRoleKey = unAuthorizedRoleProperty.name;
