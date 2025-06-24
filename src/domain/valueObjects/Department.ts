import { Err, Ok, type Result } from "../common/Result";

export enum DepartmentType {
  CS = "CS",
  BI = "BI",
  IA = "IA",
  GRADUATE = "GRADUATE",
  OTHERS = "OTHERS",
  OBOG = "OB/OG",
}

export class Department {
  private constructor(private readonly value: DepartmentType) {}

  static readonly CS = new Department(DepartmentType.CS);
  static readonly BI = new Department(DepartmentType.BI);
  static readonly IA = new Department(DepartmentType.IA);
  static readonly GRADUATE = new Department(DepartmentType.GRADUATE);
  static readonly OTHERS = new Department(DepartmentType.OTHERS);
  static readonly OBOG = new Department(DepartmentType.OBOG);

  static create(value: string): Result<Department, Error> {
    switch (value.toUpperCase()) {
      case "CS":
        return Ok(Department.CS);
      case "BI":
        return Ok(Department.BI);
      case "IA":
        return Ok(Department.IA);
      case "GRADUATE":
        return Ok(Department.GRADUATE);
      case "OTHERS":
        return Ok(Department.OTHERS);
      case "OB/OG":
      case "OBOG":
        return Ok(Department.OBOG);
      default:
        return Err(new Error(`Invalid department: ${value}`));
    }
  }

  getValue(): DepartmentType {
    return this.value;
  }

  getRoleName(): string {
    return this.value;
  }

  isGraduate(): boolean {
    return this.value === DepartmentType.GRADUATE;
  }

  isAlumni(): boolean {
    return this.value === DepartmentType.OBOG;
  }

  isCurrentStudent(): boolean {
    return !this.isGraduate() && !this.isAlumni();
  }

  equals(other: Department): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
