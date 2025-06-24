import type { Result } from "../common/Result";
import type { Member } from "../entities/NewMember";
import type { Email } from "../valueObjects/Email";
import type { StudentNumber } from "../valueObjects/StudentNumber";
import type { DiscordId } from "../valueObjects/ids/DiscordId";
import type { MemberId } from "../valueObjects/ids/MemberId";

export interface MemberRepository {
  save(member: Member): Promise<Result<void, Error>>;
  findById(id: MemberId): Promise<Result<Member | null, Error>>;
  findByDiscordId(discordId: DiscordId): Promise<Result<Member | null, Error>>;
  findByEmail(email: Email): Promise<Result<Member | null, Error>>;
  findByStudentNumber(
    studentNumber: StudentNumber,
  ): Promise<Result<Member | null, Error>>;
  delete(id: MemberId): Promise<Result<void, Error>>;
}
