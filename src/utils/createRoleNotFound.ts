import { ColorResolvable, Guild, Role } from 'discord.js';
import createRoleNotFoundParams from '../types/createRoleNotFoundParams';

async function createRoleIfNotFound({ guild, roleName, color, reason }: createRoleNotFoundParams): Promise<Role> {
    const roles = await guild.roles.fetch()
    let role: Role | undefined = roles.find(r => r.name === roleName);
    if (!role) {
        try {
            role = await guild.roles.create({
                name: roleName,
                color: color,
                reason: reason,
            });
            console.log(`${roleName} role created.`);
        } catch (error) {
            console.error(`Error creating ${roleName} role:`, error);
            throw error;
        }
    }
    return role;
}

export default createRoleIfNotFound;