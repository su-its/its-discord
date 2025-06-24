import { describe, it, expect } from "vitest";
import { StudentNumber } from "../StudentNumber";

describe("StudentNumber", () => {
  describe("create", () => {
    it("正しい形式の学籍番号で作成できる", () => {
      const result = StudentNumber.create("12345678");
      
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().getValue()).toBe("12345678");
    });

    it("8文字未満の場合はエラー", () => {
      const result = StudentNumber.create("1234567");
      
      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toBe("Student number must be 8 alphanumeric characters");
    });

    it("8文字超過の場合はエラー", () => {
      const result = StudentNumber.create("123456789");
      
      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toBe("Student number must be 8 alphanumeric characters");
    });

    it("空文字の場合はエラー", () => {
      const result = StudentNumber.create("");
      
      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toBe("Student number cannot be empty");
    });

    it("特殊文字が含まれる場合はエラー", () => {
      const result = StudentNumber.create("1234567@");
      
      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toBe("Student number must be 8 alphanumeric characters");
    });

    it("小文字を大文字に変換する", () => {
      const result = StudentNumber.create("abcd1234");
      
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().getValue()).toBe("ABCD1234");
    });
  });

  describe("equals", () => {
    it("同じ値の場合はtrue", () => {
      const studentNumber1 = StudentNumber.create("12345678").getValue();
      const studentNumber2 = StudentNumber.create("12345678").getValue();
      
      expect(studentNumber1.equals(studentNumber2)).toBe(true);
    });

    it("異なる値の場合はfalse", () => {
      const studentNumber1 = StudentNumber.create("12345678").getValue();
      const studentNumber2 = StudentNumber.create("87654321").getValue();
      
      expect(studentNumber1.equals(studentNumber2)).toBe(false);
    });
  });
});