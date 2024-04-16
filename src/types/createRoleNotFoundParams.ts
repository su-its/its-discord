import { Guild } from "discord.js";
import CustomRole from "./customRole";

type createRoleNotFoundParams = {
    guild: Guild;
    customRole: CustomRole,
};

export default createRoleNotFoundParams;
