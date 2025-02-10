import makeDepartmentRole from "../../../utils/makeDepartmentRole";
import type CustomRole from "../../types/customRole";

const othersRole: CustomRole = makeDepartmentRole({
  department: "OTHERS",
  color: [128, 0, 128],
  reason: "Role for non informatics major students",
});
export default othersRole;
