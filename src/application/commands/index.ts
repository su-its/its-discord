import CommandRegistry from "./core/commandRegistry";
import authCommand from "./implementations/auth";
import graduateCommand from "./implementations/graduate";
import healthCheckCommand from "./implementations/healthCheck";
import hotChannelsCommand from "./implementations/hotChannel";
import killCommand from "./implementations/kill";
import psCommand from "./implementations/ps";
import registerCommand from "./implementations/register";
import renameALL from "./implementations/renameAll";
import whoCommand from "./implementations/who";

const registry = new CommandRegistry();

registry.register(authCommand);
registry.register(healthCheckCommand);
registry.register(hotChannelsCommand);
registry.register(killCommand);
registry.register(psCommand);
registry.register(registerCommand);
registry.register(renameALL);
registry.register(whoCommand);
registry.register(graduateCommand);

export default registry;
