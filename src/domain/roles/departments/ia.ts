import makeDepartmentRole from "../../../utils/makeDepartmentRole";
import type CustomRole from "../../types/customRole";

const iaRole: CustomRole = makeDepartmentRole({
  department: "IA",
  color: [0, 128, 0],
  reason: "BI Department Role",
});
export default iaRole;
