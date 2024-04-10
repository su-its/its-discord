import { Guild, ColorResolvable } from "discord.js";

type createRoleNotFoundParams = {
    guild: Guild;
    roleName: string;
    color: ColorResolvable;
    reason: string;
};

export default createRoleNotFoundParams;
