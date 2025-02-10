import type { PrismaClient } from "@shizuoka-its/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Department from "../../../domain/entities/department";
import { RepositoryError } from "../RepositoryError";
import MemberRepository from "../memberRepository";

// モックPrismaClientの型定義
type MockPrismaClient = {
  member: {
    findMany: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  discordAccount: {
    findMany: ReturnType<typeof vi.fn>;
  };
};

describe("MemberRepository", () => {
  let mockPrismaClient: MockPrismaClient;
  let repository: MemberRepository;

  const mockMember = {
    id: "test-id",
    name: "Test User",
    studentId: "19XX0000",
    department: Department.CS,
    email: "test@example.com",
    discordAccounts: [
      {
        id: "discord-id",
        nickName: "Discord User",
      },
    ],
  };

  beforeEach(() => {
    // PrismaClientのモックを作成
    mockPrismaClient = {
      member: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      discordAccount: {
        findMany: vi.fn(),
      },
    };
    repository = new MemberRepository(
      mockPrismaClient as unknown as PrismaClient,
    );
  });

  describe("メンバー取得機能", () => {
    it("全てのメンバーを取得できる", async () => {
      mockPrismaClient.member.findMany.mockResolvedValue([mockMember]);

      const result = await repository.getAll();

      expect(mockPrismaClient.member.findMany).toHaveBeenCalledWith({
        include: { discordAccounts: true },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockMember.id,
        name: mockMember.name,
        student_number: mockMember.studentId,
        department: mockMember.department,
        mail: mockMember.email,
        discordId: mockMember.discordAccounts[0].id,
      });
    });
  });

  describe("メンバーID検索機能", () => {
    it("IDで指定したメンバーを取得できる", async () => {
      mockPrismaClient.member.findUnique.mockResolvedValue(mockMember);

      const result = await repository.getById("test-id");

      expect(mockPrismaClient.member.findUnique).toHaveBeenCalledWith({
        where: { id: "test-id" },
        include: { discordAccounts: true },
      });
      expect(result).not.toBeNull();
      expect(result?.id).toBe(mockMember.id);
    });

    it("存在しないIDの場合はnullを返す", async () => {
      mockPrismaClient.member.findUnique.mockResolvedValue(null);

      const result = await repository.getById("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("Discord ID検索機能", () => {
    it("DiscordIDで指定したメンバーを取得できる", async () => {
      mockPrismaClient.member.findFirst.mockResolvedValue(mockMember);

      const result = await repository.getByDiscordId("discord-id");

      expect(mockPrismaClient.member.findFirst).toHaveBeenCalledWith({
        where: { discordAccounts: { some: { id: "discord-id" } } },
        include: { discordAccounts: true },
      });
      expect(result).not.toBeNull();
      expect(result?.discordId).toBe(mockMember.discordAccounts[0].id);
    });

    it("存在しないDiscordIDの場合はnullを返す", async () => {
      mockPrismaClient.member.findFirst.mockResolvedValue(null);

      const result = await repository.getByDiscordId("non-existent-discord-id");

      expect(result).toBeNull();
    });
  });

  describe("メールアドレス検索機能", () => {
    it("メールアドレスで指定したメンバーを取得できる", async () => {
      mockPrismaClient.member.findFirst.mockResolvedValue(mockMember);

      const result = await repository.getByEmail("test@example.com");

      expect(mockPrismaClient.member.findFirst).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
        include: { discordAccounts: true },
      });
      expect(result).not.toBeNull();
      expect(result?.mail).toBe(mockMember.email);
    });

    it("存在しないメールアドレスの場合はnullを返す", async () => {
      mockPrismaClient.member.findFirst.mockResolvedValue(null);

      const result = await repository.getByEmail("nonexistent@example.com");

      expect(result).toBeNull();
    });
  });

  describe("メンバー登録機能", () => {
    it("新しいメンバーを作成できる", async () => {
      mockPrismaClient.member.create.mockResolvedValue(mockMember);

      const input = {
        name: "Test User",
        student_number: "19XX0000",
        department: Department.CS,
        mail: "test@example.com",
      };

      const result = await repository.insert(input);

      expect(mockPrismaClient.member.create).toHaveBeenCalledWith({
        data: {
          name: input.name,
          studentId: input.student_number,
          department: input.department,
          email: input.mail,
        },
        include: { discordAccounts: true },
      });
      expect(result.id).toBe(mockMember.id);
    });
  });

  describe("メンバー更新機能", () => {
    it("メンバー情報を更新できる", async () => {
      mockPrismaClient.member.update.mockResolvedValue(mockMember);

      const input = {
        id: "test-id",
        name: "Updated Name",
        student_number: "20XX0000",
      };

      const result = await repository.update(input);

      expect(mockPrismaClient.member.update).toHaveBeenCalledWith({
        where: { id: input.id },
        data: {
          name: input.name,
          studentId: input.student_number,
          department: undefined,
          email: undefined,
        },
        include: { discordAccounts: true },
      });
      expect(result.id).toBe(mockMember.id);
    });
  });

  describe("Discordアカウント連携機能", () => {
    it("Discordアカウントを紐付けできる", async () => {
      mockPrismaClient.discordAccount.findMany.mockResolvedValue([]);
      mockPrismaClient.member.update.mockResolvedValue(mockMember);

      const input = {
        memberId: "test-id",
        discordAccount: {
          id: "discord-id",
          nickName: "Discord User",
        },
      };

      const result = await repository.connectDiscordAccount(input);

      expect(mockPrismaClient.member.update).toHaveBeenCalledWith({
        where: { id: input.memberId },
        data: {
          discordAccounts: {
            connectOrCreate: {
              where: { id: input.discordAccount.id },
              create: {
                id: input.discordAccount.id,
                nickName: input.discordAccount.nickName,
              },
            },
          },
        },
        include: { discordAccounts: true },
      });
      expect(result.discordId).toBe(input.discordAccount.id);
    });

    // TODO: 複数アカウントに対応する https://github.com/su-its/its-discord/issues/70
    it("既にDiscordアカウントが紐付けられている場合はエラーを投げる", async () => {
      mockPrismaClient.discordAccount.findMany.mockResolvedValue([
        { id: "existing-discord-id" },
      ]);

      const input = {
        memberId: "test-id",
        discordAccount: {
          id: "new-discord-id",
          nickName: "Discord User",
        },
      };

      await expect(repository.connectDiscordAccount(input)).rejects.toThrow(
        "Member already has a Discord account",
      );
    });
  });

  describe("エラーハンドリング機能", () => {
    const prismaError = new Error("Simulated Prisma Error");

    // --- Error オブジェクトでの rejection ケース ---
    describe("Error オブジェクトでの rejection", () => {
      it("全メンバー取得時のPrismaエラーをRepositoryErrorでラップする", async () => {
        mockPrismaClient.member.findMany.mockRejectedValue(prismaError);
        try {
          await repository.getAll();
          throw new Error("Expected method to throw.");
        } catch (error) {
          expect(error).toBeInstanceOf(RepositoryError);
          expect((error as RepositoryError).message).toContain(
            "Failed to get all members",
          );
          expect((error as RepositoryError).innerError).toBe(prismaError);
        }
      });

      it("ID検索時のPrismaエラーをRepositoryErrorでラップする", async () => {
        mockPrismaClient.member.findUnique.mockRejectedValue(prismaError);
        try {
          await repository.getById("test-id");
          throw new Error("Expected method to throw.");
        } catch (error) {
          expect(error).toBeInstanceOf(RepositoryError);
          expect((error as RepositoryError).message).toContain(
            "Failed to get member by id: test-id",
          );
          expect((error as RepositoryError).innerError).toBe(prismaError);
        }
      });

      it("Discord ID検索時のPrismaエラーをRepositoryErrorでラップする", async () => {
        mockPrismaClient.member.findFirst.mockRejectedValue(prismaError);
        try {
          await repository.getByDiscordId("discord-id");
          throw new Error("Expected method to throw.");
        } catch (error) {
          expect(error).toBeInstanceOf(RepositoryError);
          expect((error as RepositoryError).message).toContain(
            "Failed to get member by discord id: discord-id",
          );
          expect((error as RepositoryError).innerError).toBe(prismaError);
        }
      });

      it("メールアドレス検索時のPrismaエラーをRepositoryErrorでラップする", async () => {
        mockPrismaClient.member.findFirst.mockRejectedValue(prismaError);
        try {
          await repository.getByEmail("test@example.com");
          throw new Error("Expected method to throw.");
        } catch (error) {
          expect(error).toBeInstanceOf(RepositoryError);
          expect((error as RepositoryError).message).toContain(
            "Failed to get member by email: test@example.com",
          );
          expect((error as RepositoryError).innerError).toBe(prismaError);
        }
      });

      it("メンバー登録時のPrismaエラーをRepositoryErrorでラップする", async () => {
        mockPrismaClient.member.create.mockRejectedValue(prismaError);
        const input = {
          name: "Test User",
          student_number: "19XX0000",
          department: Department.CS,
          mail: "test@example.com",
        };
        try {
          await repository.insert(input);
          throw new Error("Expected method to throw.");
        } catch (error) {
          expect(error).toBeInstanceOf(RepositoryError);
          expect((error as RepositoryError).message).toContain(
            "Failed to insert new member",
          );
          expect((error as RepositoryError).innerError).toBe(prismaError);
        }
      });

      it("メンバー更新時のPrismaエラーをRepositoryErrorでラップする", async () => {
        mockPrismaClient.member.update.mockRejectedValue(prismaError);
        const input = {
          id: "test-id",
          name: "Updated Name",
          student_number: "20XX0000",
        };
        try {
          await repository.update(input);
          throw new Error("Expected method to throw.");
        } catch (error) {
          expect(error).toBeInstanceOf(RepositoryError);
          expect((error as RepositoryError).message).toContain(
            "Failed to update member with id: test-id",
          );
          expect((error as RepositoryError).innerError).toBe(prismaError);
        }
      });

      it("Discordアカウント連携時のPrismaエラーをRepositoryErrorでラップする", async () => {
        // 既存の Discord アカウントが無い状態で、update 時にエラーをシミュレーション
        mockPrismaClient.discordAccount.findMany.mockResolvedValue([]);
        mockPrismaClient.member.update.mockRejectedValue(prismaError);
        const input = {
          memberId: "test-id",
          discordAccount: {
            id: "discord-id",
            nickName: "Discord User",
          },
        };
        try {
          await repository.connectDiscordAccount(input);
          throw new Error("Expected method to throw.");
        } catch (error) {
          expect(error).toBeInstanceOf(RepositoryError);
          expect((error as RepositoryError).message).toContain(
            "Failed to connect Discord account for member id: test-id",
          );
          expect((error as RepositoryError).innerError).toBe(prismaError);
        }
      });

      it("既存のDiscordアカウントがある場合はRepositoryErrorを投げる", async () => {
        // 既に Discord アカウントが紐付いている状態をシミュレーション
        mockPrismaClient.discordAccount.findMany.mockResolvedValue([
          { id: "existing-discord-id" },
        ]);
        const input = {
          memberId: "test-id",
          discordAccount: {
            id: "new-discord-id",
            nickName: "Discord User",
          },
        };
        try {
          await repository.connectDiscordAccount(input);
          throw new Error("Expected method to throw.");
        } catch (error) {
          expect(error).toBeInstanceOf(RepositoryError);
          expect((error as RepositoryError).message).toContain(
            "Member already has a Discord account",
          );
          // このケースでは innerError は存在しなくても OK
        }
      });
    });

    // --- 非 Error オブジェクトでの rejection ケース ---
    describe("非 Error オブジェクトでの rejection", () => {
      it("getAll: 非 Error rejection を RepositoryError でラップし innerError は undefined", async () => {
        mockPrismaClient.member.findMany.mockRejectedValue(
          "Non-Error rejection",
        );
        try {
          await repository.getAll();
          throw new Error("Expected method to throw.");
        } catch (error) {
          expect(error).toBeInstanceOf(RepositoryError);
          expect((error as RepositoryError).message).toContain(
            "Failed to get all members",
          );
          expect((error as RepositoryError).innerError).toBeUndefined();
        }
      });

      it("getById: 非 Error rejection を RepositoryError でラップし innerError は undefined", async () => {
        mockPrismaClient.member.findUnique.mockRejectedValue(
          "Non-Error rejection",
        );
        try {
          await repository.getById("test-id");
          throw new Error("Expected method to throw.");
        } catch (error) {
          expect(error).toBeInstanceOf(RepositoryError);
          expect((error as RepositoryError).message).toContain(
            "Failed to get member by id: test-id",
          );
          expect((error as RepositoryError).innerError).toBeUndefined();
        }
      });

      it("getByDiscordId: 非 Error rejection を RepositoryError でラップし innerError は undefined", async () => {
        mockPrismaClient.member.findFirst.mockRejectedValue(
          "Non-Error rejection",
        );
        try {
          await repository.getByDiscordId("discord-id");
          throw new Error("Expected method to throw.");
        } catch (error) {
          expect(error).toBeInstanceOf(RepositoryError);
          expect((error as RepositoryError).message).toContain(
            "Failed to get member by discord id: discord-id",
          );
          expect((error as RepositoryError).innerError).toBeUndefined();
        }
      });

      it("getByEmail: 非 Error rejection を RepositoryError でラップし innerError は undefined", async () => {
        mockPrismaClient.member.findFirst.mockRejectedValue(
          "Non-Error rejection",
        );
        try {
          await repository.getByEmail("test@example.com");
          throw new Error("Expected method to throw.");
        } catch (error) {
          expect(error).toBeInstanceOf(RepositoryError);
          expect((error as RepositoryError).message).toContain(
            "Failed to get member by email: test@example.com",
          );
          expect((error as RepositoryError).innerError).toBeUndefined();
        }
      });

      it("insert: 非 Error rejection を RepositoryError でラップし innerError は undefined", async () => {
        mockPrismaClient.member.create.mockRejectedValue("Non-Error rejection");
        const input = {
          name: "Test User",
          student_number: "19XX0000",
          department: Department.CS,
          mail: "test@example.com",
        };
        try {
          await repository.insert(input);
          throw new Error("Expected method to throw.");
        } catch (error) {
          expect(error).toBeInstanceOf(RepositoryError);
          expect((error as RepositoryError).message).toContain(
            "Failed to insert new member",
          );
          expect((error as RepositoryError).innerError).toBeUndefined();
        }
      });

      it("update: 非 Error rejection を RepositoryError でラップし innerError は undefined", async () => {
        mockPrismaClient.member.update.mockRejectedValue("Non-Error rejection");
        const input = {
          id: "test-id",
          name: "Updated Name",
          student_number: "20XX0000",
        };
        try {
          await repository.update(input);
          throw new Error("Expected method to throw.");
        } catch (error) {
          expect(error).toBeInstanceOf(RepositoryError);
          expect((error as RepositoryError).message).toContain(
            "Failed to update member with id: test-id",
          );
          expect((error as RepositoryError).innerError).toBeUndefined();
        }
      });

      it("connectDiscordAccount: 非 Error rejection を RepositoryError でラップし innerError は undefined", async () => {
        // 既存の Discord アカウントが無い状態で、update 時に非 Error の rejection をシミュレーション
        mockPrismaClient.discordAccount.findMany.mockResolvedValue([]);
        mockPrismaClient.member.update.mockRejectedValue("Non-Error rejection");
        const input = {
          memberId: "test-id",
          discordAccount: {
            id: "discord-id",
            nickName: "Discord User",
          },
        };
        try {
          await repository.connectDiscordAccount(input);
          throw new Error("Expected method to throw.");
        } catch (error) {
          expect(error).toBeInstanceOf(RepositoryError);
          expect((error as RepositoryError).message).toContain(
            "Failed to connect Discord account for member id: test-id",
          );
          expect((error as RepositoryError).innerError).toBeUndefined();
        }
      });
    });
  });
});
