import makeDepartmentRole from "../../../utils/makeDepartmentRole";
import type CustomRole from "../../types/customRole";

const graduateRole: CustomRole = makeDepartmentRole({
  department: "GRADUATE",
  color: [255, 215, 0],
  reason: "Graduate student Role",
});
export default graduateRole;
