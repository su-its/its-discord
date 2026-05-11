import type Affiliation from "@domain/entities/affiliation";
import biRole, { biRoleKey } from "./implementations/bi";
import csRole, { csRoleKey } from "./implementations/cs";
import engineeringRole, {
  engineeringRoleKey,
} from "./implementations/engineering";
import graduateRole, { graduateRoleKey } from "./implementations/graduate";
import iaRole, { iaRoleKey } from "./implementations/ia";
import othersRole, { othersRoleKey } from "./implementations/others";

export const departmentRoles = [
  csRole,
  biRole,
  iaRole,
  graduateRole,
  engineeringRole,
  othersRole,
];

export const departmentRoleKeys = {
  csRoleKey,
  biRoleKey,
  iaRoleKey,
  graduateRoleKey,
  engineeringRoleKey,
  othersRoleKey,
};

/** 所属（Affiliation）からロールキーへのマッピング */
export const affiliationRoleMap: Record<Affiliation, string> = {
  情報科学科: csRoleKey,
  行動情報学科: biRoleKey,
  情報社会学科: iaRoleKey,
  工学部: engineeringRoleKey,
  大学院: graduateRoleKey,
  その他: othersRoleKey,
};
