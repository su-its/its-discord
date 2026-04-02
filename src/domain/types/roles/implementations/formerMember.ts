import type Role from "../../role";
import { BOT_PREFIX } from "../constants";

const formerMemberRole: Role = {
  name: `${BOT_PREFIX}旧室員`,
  previousNames: ["DP:OB/OG"],
  color: [0, 128, 128],
  reason: "旧室員ロール",
};

export default formerMemberRole;
export const formerMemberRoleKey = formerMemberRole.name;
