import type { ColorResolvable } from "discord.js";

interface CustomRole {
  roleName: string;
  color: ColorResolvable;
  reason: string;
}

export default CustomRole;
