import CommandRegistry from "./core/commandRegistry";
import {
  auth,
  authDM,
  healthCheck,
  hotChannels,
  kill,
  nick,
  ps,
  register,
  renameAll,
  who,
} from "./implementations";

const registry = new CommandRegistry();

registry.register(auth);
registry.register(authDM);
registry.register(healthCheck);
registry.register(hotChannels);
registry.register(kill);
registry.register(nick);
registry.register(ps);
registry.register(register);
registry.register(renameAll);
registry.register(who);

export default registry;
