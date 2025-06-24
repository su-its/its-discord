import { Result } from "../common/Result";
import { Member } from "../entities/NewMember";
import { MemberId } from "../valueObjects/ids/MemberId";
import { DiscordId } from "../valueObjects/ids/DiscordId";
import { Email } from "../valueObjects/Email";
import { StudentNumber } from "../valueObjects/StudentNumber";

export interface MemberRepository {
  save(member: Member): Promise<Result<void, Error>>;
  findById(id: MemberId): Promise<Result<Member | null, Error>>;
  findByDiscordId(discordId: DiscordId): Promise<Result<Member | null, Error>>;
  findByEmail(email: Email): Promise<Result<Member | null, Error>>;
  findByStudentNumber(studentNumber: StudentNumber): Promise<Result<Member | null, Error>>;
  delete(id: MemberId): Promise<Result<void, Error>>;
}