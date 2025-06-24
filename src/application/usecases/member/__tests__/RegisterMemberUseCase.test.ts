import { describe, it, expect, beforeEach, vi } from "vitest";
import { RegisterMemberUseCase, RegisterMemberRequest } from "../RegisterMemberUseCase";
import { MockMemberRepository } from "./mocks/MockMemberRepository";
import { MockEventDispatcher } from "./mocks/MockEventDispatcher";
import { MemberAuthenticationService } from "../../../../domain/services/MemberAuthenticationService";
import { RoleAssignmentService } from "../../../../domain/services/RoleAssignmentService";
import { NicknameGenerationService } from "../../../../domain/services/NicknameGenerationService";
import { MemberAggregateFactory } from "../../../../domain/factories/MemberAggregateFactory";
import { ITSCoreAdapter } from "../../../../domain/services/ITSCoreAdapter";
import { EmailAuthAdapter } from "../../../../domain/services/EmailAuthAdapter";
import { Result, Ok } from "../../../../domain/common/Result";

// モックの作成
const mockITSCoreAdapter: ITSCoreAdapter = {
  async findMember() {
    return Ok({
      name: "山田太郎",
      studentNumber: "12345678",
      email: "yamada@shizuoka.ac.jp",
      department: "CS"
    });
  },
  async getAllMembers() {
    return Ok([]);
  }
};

const mockEmailAuthAdapter: EmailAuthAdapter = {
  async sendAuthEmail() {
    return Ok(undefined);
  },
  async verifyEmailAuth() {
    return Ok(true);
  }
};

describe("RegisterMemberUseCase", () => {
  let useCase: RegisterMemberUseCase;
  let mockRepository: MockMemberRepository;
  let mockEventDispatcher: MockEventDispatcher;
  let memberAggregateFactory: MemberAggregateFactory;

  beforeEach(() => {
    mockRepository = new MockMemberRepository();
    mockEventDispatcher = new MockEventDispatcher();
    
    const authenticationService = new MemberAuthenticationService(mockITSCoreAdapter);
    const roleAssignmentService = new RoleAssignmentService();
    const nicknameGenerationService = new NicknameGenerationService();
    
    memberAggregateFactory = new MemberAggregateFactory(
      authenticationService,
      roleAssignmentService,
      nicknameGenerationService,
      mockEmailAuthAdapter
    );

    useCase = new RegisterMemberUseCase(
      memberAggregateFactory,
      mockRepository,
      mockEventDispatcher
    );

    mockRepository.clear();
    mockEventDispatcher.clear();
  });

  describe("execute", () => {
    const validRequest: RegisterMemberRequest = {
      name: "山田太郎",
      studentNumber: "12345678",
      email: "yamada@shizuoka.ac.jp",
      department: "CS",
      discordId: "123456789012345678"
    };

    it("正常なリクエストでメンバー登録ができる", async () => {
      const result = await useCase.execute(validRequest);

      expect(result.isSuccess()).toBe(true);
      const response = result.getValue();
      expect(response.message).toBe("認証メールを送信しました。メールを確認して認証を完了してください。");
      expect(response.memberId).toBeDefined();
    });

    it("メンバーがリポジトリに保存される", async () => {
      await useCase.execute(validRequest);

      expect(mockRepository.saveCallCount).toBe(1);
      expect(mockRepository.getMemberCount()).toBe(1);
    });

    it("ドメインイベントが発行される", async () => {
      await useCase.execute(validRequest);

      expect(mockEventDispatcher.dispatchCallCount).toBe(1);
      expect(mockEventDispatcher.getEventsByType("MemberRegistered")).toHaveLength(1);
      expect(mockEventDispatcher.getEventsByType("MemberDiscordRegistered")).toHaveLength(1);
    });

    it("無効な学籍番号の場合はエラー", async () => {
      const invalidRequest = { ...validRequest, studentNumber: "invalid" };
      
      const result = await useCase.execute(invalidRequest);

      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toBe("Student number must be 8 alphanumeric characters");
    });

    it("無効なメールアドレスの場合はエラー", async () => {
      const invalidRequest = { ...validRequest, email: "invalid@gmail.com" };
      
      const result = await useCase.execute(invalidRequest);

      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toBe("Email must be from shizuoka.ac.jp domain");
    });

    it("無効な学科の場合はエラー", async () => {
      const invalidRequest = { ...validRequest, department: "INVALID" };
      
      const result = await useCase.execute(invalidRequest);

      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toBe("Invalid department: INVALID");
    });

    it("無効なDiscord IDの場合はエラー", async () => {
      const invalidRequest = { ...validRequest, discordId: "invalid" };
      
      const result = await useCase.execute(invalidRequest);

      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toBe("Discord ID must be 17-19 digits");
    });
  });
});