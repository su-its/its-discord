import { Events, Guild, GuildMember, Role } from 'discord.js';
import { CustomClient } from '../types/customClient';
import createRoleIfNotFound from '../utils/createRoleNotFound';

export function setupGuildMemberAddHandler(client: CustomClient) {
    client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
        await sendDM(member);
        await giveUnauthorizedRole(member);
    });
};

async function sendDM(member: GuildMember) {
    try {
        await member.send(`ようこそ ${member.displayName} さん！...`)
        console.log(`Welcome message sent to ${member.displayName}.`);
    } catch (error) {
        console.error('Error sending DM:', error);
    }
};

async function giveUnauthorizedRole(member: GuildMember) {
    try {
        const guild: Guild = member.guild;
        const role: Role = await createRoleIfNotFound({ guild, roleName: 'Unauthorized', color: 'Grey', reason: 'Unauthorized role for new members.' });
        await member.roles.add(role);
        console.log(`Unauthorized role has been assigned to ${member.displayName}.`);
    } catch (error) {
        console.error('Error creating Unauthorized role:', error);
    }
};