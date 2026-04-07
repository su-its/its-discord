import CommandRegistry from "./core/commandRegistry";
import auth from "./implementations/auth";
import door from "./implementations/door";
import healthCheck from "./implementations/healthCheck";
import hotChannels from "./implementations/hotChannels";
import kill from "./implementations/kill";
import nick from "./implementations/nick";
import ps from "./implementations/ps";
import refreshRoles from "./implementations/refreshRoles";
import register from "./implementations/register";
import renameAll from "./implementations/renameAll";
import who from "./implementations/who";

const registry = new CommandRegistry();

registry.register(auth);
registry.register(healthCheck);
registry.register(hotChannels);
registry.register(kill);
registry.register(nick);
registry.register(ps);
registry.register(refreshRoles);
registry.register(register);
registry.register(renameAll);
registry.register(who);
registry.register(door);

export default registry;
