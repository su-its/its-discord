import { Result, Ok, Err } from "../../domain/common/Result";
import { MemberRepository } from "../../domain/repositories/MemberRepository";
import { Member } from "../../domain/entities/NewMember";
import { MemberId } from "../../domain/valueObjects/ids/MemberId";
import { DiscordId } from "../../domain/valueObjects/ids/DiscordId";
import { Email } from "../../domain/valueObjects/Email";
import { StudentNumber } from "../../domain/valueObjects/StudentNumber";

// 仮のインメモリ実装 - 後でFirebase/DBで置き換え
export class InMemoryMemberRepository implements MemberRepository {
  private members: Map<string, Member> = new Map();

  async save(member: Member): Promise<Result<void, Error>> {
    try {
      this.members.set(member.id.toValue(), member);
      return Ok(undefined);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Failed to save member"));
    }
  }

  async findById(id: MemberId): Promise<Result<Member | null, Error>> {
    try {
      const member = this.members.get(id.toValue()) || null;
      return Ok(member);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Failed to find member by ID"));
    }
  }

  async findByDiscordId(discordId: DiscordId): Promise<Result<Member | null, Error>> {
    try {
      for (const member of this.members.values()) {
        if (member.discordProfile?.discordId.equals(discordId)) {
          return Ok(member);
        }
      }
      return Ok(null);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Failed to find member by Discord ID"));
    }
  }

  async findByEmail(email: Email): Promise<Result<Member | null, Error>> {
    try {
      for (const member of this.members.values()) {
        if (member.email.equals(email)) {
          return Ok(member);
        }
      }
      return Ok(null);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Failed to find member by email"));
    }
  }

  async findByStudentNumber(studentNumber: StudentNumber): Promise<Result<Member | null, Error>> {
    try {
      for (const member of this.members.values()) {
        if (member.studentNumber.equals(studentNumber)) {
          return Ok(member);
        }
      }
      return Ok(null);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Failed to find member by student number"));
    }
  }

  async delete(id: MemberId): Promise<Result<void, Error>> {
    try {
      this.members.delete(id.toValue());
      return Ok(undefined);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Failed to delete member"));
    }
  }
}