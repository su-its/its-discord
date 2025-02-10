import makeDepartmentRole from "../../../utils/makeDepartmentRole";
import type CustomRole from "../../types/customRole";

const csRole: CustomRole = makeDepartmentRole({
  department: "CS",
  color: "Orange",
  reason: "CS Department Role",
});
export default csRole;
