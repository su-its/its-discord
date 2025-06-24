import { describe, it, expect } from "vitest";
import { Department } from "../Department";

describe("Department", () => {
  describe("create", () => {
    it("CSで作成できる", () => {
      const result = Department.create("CS");
      
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().getValue()).toBe("CS");
    });

    it("IAで作成できる", () => {
      const result = Department.create("IA");
      
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().getValue()).toBe("IA");
    });

    it("BIで作成できる", () => {
      const result = Department.create("BI");
      
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().getValue()).toBe("BI");
    });

    it("GRADUATEで作成できる", () => {
      const result = Department.create("GRADUATE");
      
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().getValue()).toBe("GRADUATE");
    });

    it("OTHERSで作成できる", () => {
      const result = Department.create("OTHERS");
      
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().getValue()).toBe("OTHERS");
    });

    it("OBOGで作成できる", () => {
      const result = Department.create("OBOG");
      
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().getValue()).toBe("OB/OG");
    });

    it("OB/OGで作成できる", () => {
      const result = Department.create("OB/OG");
      
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().getValue()).toBe("OB/OG");
    });

    it("小文字でも作成できる", () => {
      const result = Department.create("cs");
      
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().getValue()).toBe("CS");
    });

    it("無効な学科の場合はエラー", () => {
      const result = Department.create("INVALID");
      
      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toBe("Invalid department: INVALID");
    });
  });

  describe("business rules", () => {
    it("GRADUATEは大学院生", () => {
      const department = Department.create("GRADUATE").getValue();
      
      expect(department.isGraduate()).toBe(true);
      expect(department.isAlumni()).toBe(false);
      expect(department.isCurrentStudent()).toBe(false);
    });

    it("OBOGは卒業生", () => {
      const department = Department.create("OBOG").getValue();
      
      expect(department.isGraduate()).toBe(false);
      expect(department.isAlumni()).toBe(true);
      expect(department.isCurrentStudent()).toBe(false);
    });

    it("CSは現役学生", () => {
      const department = Department.create("CS").getValue();
      
      expect(department.isGraduate()).toBe(false);
      expect(department.isAlumni()).toBe(false);
      expect(department.isCurrentStudent()).toBe(true);
    });

    it("ロール名を取得できる", () => {
      const department = Department.create("CS").getValue();
      
      expect(department.getRoleName()).toBe("CS");
    });
  });
});