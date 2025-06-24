import type { Result } from "../../domain/common/Result";
import OldDepartment from "../../domain/entities/department";
import { Department } from "../../domain/valueObjects/Department";

export class DepartmentAdapter {
  static fromOldDepartment(
    oldDepartment: OldDepartment,
  ): Result<Department, Error> {
    return Department.create(oldDepartment);
  }

  static toOldDepartment(department: Department): OldDepartment {
    const value = department.getValue();
    switch (value) {
      case "CS":
        return OldDepartment.CS;
      case "BI":
        return OldDepartment.BI;
      case "IA":
        return OldDepartment.IA;
      case "GRADUATE":
        return OldDepartment.GRADUATE;
      case "OTHERS":
        return OldDepartment.OTHERS;
      case "OB/OG":
        return OldDepartment.OBOG;
      default:
        throw new Error(`Unknown department value: ${value}`);
    }
  }
}
