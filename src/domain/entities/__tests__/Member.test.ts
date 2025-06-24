import { beforeEach, describe, expect, it } from "vitest";
import { Department } from "../../valueObjects/Department";
import { Email } from "../../valueObjects/Email";
import { MemberStatus } from "../../valueObjects/MemberStatus";
import { StudentNumber } from "../../valueObjects/StudentNumber";
import { DiscordId } from "../../valueObjects/ids/DiscordId";
import { Member, type MemberProps } from "../NewMember";

describe("Member", () => {
  let validProps: MemberProps;

  beforeEach(() => {
    validProps = {
      name: "山田太郎",
      studentNumber: StudentNumber.create("12345678").getValue(),
      email: Email.create("yamada@shizuoka.ac.jp").getValue(),
      department: Department.create("CS").getValue(),
    };
  });

  describe("create", () => {
    it("正しいプロパティでメンバーを作成できる", () => {
      const result = Member.create(validProps);

      expect(result.isSuccess()).toBe(true);
      const member = result.getValue();
      expect(member.name).toBe("山田太郎");
      expect(member.status).toBe(MemberStatus.PENDING);
    });

    it("名前が空の場合はエラー", () => {
      const props = { ...validProps, name: "" };
      const result = Member.create(props);

      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toBe("Member name cannot be empty");
    });

    it("名前がスペースのみの場合はエラー", () => {
      const props = { ...validProps, name: "   " };
      const result = Member.create(props);

      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toBe("Member name cannot be empty");
    });
  });

  describe("registerDiscordAccount", () => {
    it("Discord アカウントを登録できる", () => {
      const member = Member.create(validProps).getValue();
      const discordId = DiscordId.create("123456789012345678").getValue();

      const result = member.registerDiscordAccount(discordId);

      expect(result.isSuccess()).toBe(true);
      expect(member.status).toBe(MemberStatus.DISCORD_REGISTERED);
      expect(member.discordProfile?.discordId.equals(discordId)).toBe(true);
    });

    it("既にDiscordアカウントが登録済みの場合はエラー", () => {
      const member = Member.create(validProps).getValue();
      const discordId = DiscordId.create("123456789012345678").getValue();

      member.registerDiscordAccount(discordId);
      const result = member.registerDiscordAccount(discordId);

      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toBe(
        "Discord account already registered",
      );
    });
  });

  describe("verifyEmail", () => {
    it("メール認証を完了できる", () => {
      const member = Member.create(validProps).getValue();
      const discordId = DiscordId.create("123456789012345678").getValue();

      member.registerDiscordAccount(discordId);
      const result = member.verifyEmail();

      expect(result.isSuccess()).toBe(true);
      expect(member.status).toBe(MemberStatus.EMAIL_VERIFIED);
    });

    it("Discord登録前にメール認証しようとするとエラー", () => {
      const member = Member.create(validProps).getValue();

      const result = member.verifyEmail();

      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toBe(
        "Cannot verify email in status: PENDING",
      );
    });
  });

  describe("authenticate", () => {
    it("認証を完了できる", () => {
      const member = Member.create(validProps).getValue();
      const discordId = DiscordId.create("123456789012345678").getValue();

      member.registerDiscordAccount(discordId);
      member.verifyEmail();
      const result = member.authenticate();

      expect(result.isSuccess()).toBe(true);
      expect(member.status).toBe(MemberStatus.AUTHENTICATED);
    });

    it("メール認証前に認証しようとするとエラー", () => {
      const member = Member.create(validProps).getValue();
      const discordId = DiscordId.create("123456789012345678").getValue();

      member.registerDiscordAccount(discordId);
      const result = member.authenticate();

      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toBe(
        "Cannot authenticate in status: DISCORD_REGISTERED",
      );
    });
  });

  describe("getRequiredRoles", () => {
    it("認証済みメンバーは必要なロールを取得できる", () => {
      const member = Member.create(validProps).getValue();
      const discordId = DiscordId.create("123456789012345678").getValue();

      member.registerDiscordAccount(discordId);
      member.verifyEmail();
      member.authenticate();

      const roles = member.getRequiredRoles();

      expect(roles).toContain("AUTHORIZED");
      expect(roles).toContain("CS");
    });

    it("未認証メンバーは空配列", () => {
      const member = Member.create(validProps).getValue();

      const roles = member.getRequiredRoles();

      expect(roles).toEqual([]);
    });
  });

  describe("updateNickname", () => {
    it("ニックネームを更新できる", () => {
      const member = Member.create(validProps).getValue();
      const discordId = DiscordId.create("123456789012345678").getValue();

      member.registerDiscordAccount(discordId);
      const result = member.updateNickname("新しいニックネーム");

      expect(result.isSuccess()).toBe(true);
      expect(member.discordProfile?.nickname).toBe("新しいニックネーム");
    });

    it("Discordアカウント未登録の場合はエラー", () => {
      const member = Member.create(validProps).getValue();

      const result = member.updateNickname("ニックネーム");

      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toBe("Discord account not registered");
    });
  });
});
