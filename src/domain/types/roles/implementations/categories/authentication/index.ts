import authorizedRole, {
  authorizedRoleKey,
} from "./implementations/authorized";
import unauthorizedRole, {
  unauthorizedRoleKey,
} from "./implementations/unauthorized";
import unconfirmedRole, {
  unconfirmedRoleKey,
} from "./implementations/unconfirmed";

export const authenticationRoles = [
  authorizedRole,
  unauthorizedRole,
  unconfirmedRole,
];

export const authenticationRoleKeys = {
  authorizedRoleKey,
  unauthorizedRoleKey,
  unconfirmedRoleKey,
};
