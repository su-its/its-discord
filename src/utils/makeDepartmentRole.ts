import { ColorResolvable } from "discord.js";
import CustomRole from "../types/customRole";

interface makeDepartmentRoleProps {
    department: string;
    color: ColorResolvable;
    reason?: string;
};

function makeDepartmentRole({ department, color, reason }: makeDepartmentRoleProps): CustomRole {
    const role: CustomRole = {
        roleName: "DP:" + department,
        color: color,
        reason: reason ? reason : department + "Department Role",
    };

    return role;
}

export default makeDepartmentRole;