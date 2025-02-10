import makeDepartmentRole from "../../../utils/makeDepartmentRole";
import type CustomRole from "../../types/customRole";

const biRole: CustomRole = makeDepartmentRole({
  department: "BI",
  color: [0, 112, 255],
  reason: "BI Department Role",
});
export default biRole;
