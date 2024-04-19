import CustomRole from "../../types/customRole";
import makeDepartmentRole from "../../utils/makeDepartmentRole";

const biRole: CustomRole = makeDepartmentRole({ department: "BI", color: [0, 112, 255], reason: "BI Department Role" });
export default biRole;