import { Member } from "../entities/NewMember";
import { Result, Ok, Err } from "../common/Result";

export class NicknameGenerationService {
  
  generateNickname(member: Member): Result<string, Error> {
    try {
      // 基本形式: [部署] 名前
      const departmentPrefix = this.getDepartmentPrefix(member.department.getValue());
      const name = member.name;
      
      if (!name || name.trim().length === 0) {
        return Err(new Error("Member name is required for nickname generation"));
      }

      // 最大長チェック（Discordのニックネーム制限は32文字）
      const nickname = `[${departmentPrefix}] ${name}`;
      if (nickname.length > 32) {
        // 名前を短縮
        const maxNameLength = 32 - departmentPrefix.length - 3; // "[] " の3文字
        const truncatedName = name.substring(0, maxNameLength);
        return Ok(`[${departmentPrefix}] ${truncatedName}`);
      }

      return Ok(nickname);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Failed to generate nickname"));
    }
  }

  private getDepartmentPrefix(departmentValue: string): string {
    switch (departmentValue) {
      case "CS":
        return "CS";
      case "IA":
        return "IA";
      case "BI":
        return "BI";
      case "GRADUATE":
        return "院";
      case "OTHERS":
        return "他";
      case "OB/OG":
        return "OB";
      default:
        return "?";
    }
  }

  validateNickname(nickname: string): Result<void, Error> {
    if (!nickname || nickname.trim().length === 0) {
      return Err(new Error("Nickname cannot be empty"));
    }

    if (nickname.length > 32) {
      return Err(new Error("Nickname cannot exceed 32 characters"));
    }

    // 不適切な文字のチェック
    const invalidChars = /[@#:`]/;
    if (invalidChars.test(nickname)) {
      return Err(new Error("Nickname contains invalid characters"));
    }

    return Ok(undefined);
  }
}