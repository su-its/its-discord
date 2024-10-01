import type CustomRole from "../../types/customRole";
import makeDepartmentRole from "../../utils/makeDepartmentRole";

const csRole: CustomRole = makeDepartmentRole({
	department: "CS",
	color: "Orange",
	reason: "CS Department Role",
});
export default csRole;
