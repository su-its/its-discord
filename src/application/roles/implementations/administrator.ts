import type Role from "../../../domain/types/role";

const administratorRoleProperty: Role = {
  name: "Administrator",
  color: "Red",
  reason: "Role for administrators.",
};

export default administratorRoleProperty;
export const administratorRoleKey = administratorRoleProperty.name;
