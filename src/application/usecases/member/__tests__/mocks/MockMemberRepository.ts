import { Err, Ok, type Result } from "../../../../../domain/common/Result";
import type { Member } from "../../../../../domain/entities/NewMember";
import type { MemberRepository } from "../../../../../domain/repositories/MemberRepository";
import type { Email } from "../../../../../domain/valueObjects/Email";
import type { StudentNumber } from "../../../../../domain/valueObjects/StudentNumber";
import type { DiscordId } from "../../../../../domain/valueObjects/ids/DiscordId";
import type { MemberId } from "../../../../../domain/valueObjects/ids/MemberId";

export class MockMemberRepository implements MemberRepository {
  private members: Map<string, Member> = new Map();
  public saveCallCount = 0;

  async save(member: Member): Promise<Result<void, Error>> {
    this.saveCallCount++;
    this.members.set(member.id.toValue(), member);
    return Ok(undefined);
  }

  async findById(id: MemberId): Promise<Result<Member | null, Error>> {
    const member = this.members.get(id.toValue()) || null;
    return Ok(member);
  }

  async findByDiscordId(
    discordId: DiscordId,
  ): Promise<Result<Member | null, Error>> {
    for (const member of this.members.values()) {
      if (member.discordProfile?.discordId.equals(discordId)) {
        return Ok(member);
      }
    }
    return Ok(null);
  }

  async findByEmail(email: Email): Promise<Result<Member | null, Error>> {
    for (const member of this.members.values()) {
      if (member.email.equals(email)) {
        return Ok(member);
      }
    }
    return Ok(null);
  }

  async findByStudentNumber(
    studentNumber: StudentNumber,
  ): Promise<Result<Member | null, Error>> {
    for (const member of this.members.values()) {
      if (member.studentNumber.equals(studentNumber)) {
        return Ok(member);
      }
    }
    return Ok(null);
  }

  async delete(id: MemberId): Promise<Result<void, Error>> {
    this.members.delete(id.toValue());
    return Ok(undefined);
  }

  // テスト用のヘルパーメソッド
  clear(): void {
    this.members.clear();
    this.saveCallCount = 0;
  }

  addMember(member: Member): void {
    this.members.set(member.id.toValue(), member);
  }

  getMemberCount(): number {
    return this.members.size;
  }
}
