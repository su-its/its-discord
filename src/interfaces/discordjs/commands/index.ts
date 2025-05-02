import CommandRegistry from "../../../application/commands/core/commandRegistry";
import auth from "./implementations/auth";
import healthCheck from "./implementations/healthCheck";
import hotChannels from "./implementations/hotChannels";
import kill from "./implementations/kill";
import ps from "./implementations/ps";
import register from "./implementations/register";
import renameAll from "./implementations/renameAll";
import who from "./implementations/who";

const registry = new CommandRegistry();

registry.register(auth);
registry.register(healthCheck);
registry.register(hotChannels);
registry.register(kill);
registry.register(ps);
registry.register(register);
registry.register(renameAll);
registry.register(who);

export default registry;
