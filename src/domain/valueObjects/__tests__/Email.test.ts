import { describe, it, expect } from "vitest";
import { Email } from "../Email";

describe("Email", () => {
  describe("create", () => {
    it("正しい静大メールアドレスで作成できる", () => {
      const result = Email.create("test@shizuoka.ac.jp");
      
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().getValue()).toBe("test@shizuoka.ac.jp");
    });

    it("静大ドメイン以外の場合はエラー", () => {
      const result = Email.create("test@gmail.com");
      
      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toBe("Email must be from shizuoka.ac.jp domain");
    });

    it("空文字の場合はエラー", () => {
      const result = Email.create("");
      
      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toBe("Email cannot be empty");
    });

    it("不正なメール形式の場合はエラー", () => {
      const result = Email.create("invalid-email");
      
      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toBe("Invalid email format");
    });

    it("大文字を小文字に変換する", () => {
      const result = Email.create("TEST@shizuoka.ac.jp");
      
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().getValue()).toBe("test@shizuoka.ac.jp");
    });
  });

  describe("getDomain", () => {
    it("ドメイン部分を取得できる", () => {
      const email = Email.create("test@shizuoka.ac.jp").getValue();
      
      expect(email.getDomain()).toBe("shizuoka.ac.jp");
    });
  });

  describe("getLocalPart", () => {
    it("ローカル部分を取得できる", () => {
      const email = Email.create("test@shizuoka.ac.jp").getValue();
      
      expect(email.getLocalPart()).toBe("test");
    });
  });
});