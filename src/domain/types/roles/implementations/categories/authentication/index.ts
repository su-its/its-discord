import authorizedRole, {
  authorizedRoleKey,
} from "./implementations/authorized";
import unauthorizedRole, {
  unauthorizedRoleKey,
} from "./implementations/unauthorized";

export const authenticationRoles = [authorizedRole, unauthorizedRole];

export const authenticationRoleKeys = {
  authorizedRoleKey,
  unauthorizedRoleKey,
};
