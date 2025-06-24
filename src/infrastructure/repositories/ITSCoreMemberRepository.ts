import { Result, Ok, Err } from "../../domain/common/Result";
import { MemberRepository } from "../../domain/repositories/MemberRepository";
import { Member, MemberProps } from "../../domain/entities/NewMember";
import { MemberId } from "../../domain/valueObjects/ids/MemberId";
import { DiscordId } from "../../domain/valueObjects/ids/DiscordId";
import { Email } from "../../domain/valueObjects/Email";
import { StudentNumber } from "../../domain/valueObjects/StudentNumber";
import { Department } from "../../domain/valueObjects/Department";
import { MemberStatus } from "../../domain/valueObjects/MemberStatus";
import { DiscordProfile } from "../../domain/entities/DiscordProfile";
import { itsCoreService } from "../../application/services/itsCoreService";

export class ITSCoreMemberRepository implements MemberRepository {
  private memberCache: Map<string, Member> = new Map();

  async save(member: Member): Promise<Result<void, Error>> {
    try {
      // ITSCoreは読み取り専用なので、キャッシュのみに保存
      this.memberCache.set(member.id.toValue(), member);
      return Ok(undefined);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Failed to save member"));
    }
  }

  async findById(id: MemberId): Promise<Result<Member | null, Error>> {
    try {
      const member = this.memberCache.get(id.toValue()) || null;
      return Ok(member);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Failed to find member by ID"));
    }
  }

  async findByDiscordId(discordId: DiscordId): Promise<Result<Member | null, Error>> {
    try {
      // まずキャッシュをチェック
      for (const member of this.memberCache.values()) {
        if (member.discordProfile?.discordId.equals(discordId)) {
          return Ok(member);
        }
      }

      // ITSCoreから検索
      const itsMember = await itsCoreService.getMemberByDiscordId(discordId.getValue());
      if (!itsMember) {
        return Ok(null);
      }

      // ITSCoreからのデータをDomainオブジェクトに変換
      const memberResult = await this.convertITSMemberToDomainMember(itsMember, discordId);
      if (memberResult.isFailure()) {
        return Err(memberResult.getError());
      }

      const member = memberResult.getValue();
      this.memberCache.set(member.id.toValue(), member);
      return Ok(member);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Failed to find member by Discord ID"));
    }
  }

  async findByEmail(email: Email): Promise<Result<Member | null, Error>> {
    try {
      // キャッシュをチェック
      for (const member of this.memberCache.values()) {
        if (member.email.equals(email)) {
          return Ok(member);
        }
      }

      // ITSCoreから検索
      const itsMember = await itsCoreService.getMemberByEmail(email.getValue());
      if (!itsMember) {
        return Ok(null);
      }

      // DiscordIDが設定されている場合のみメンバーを作成
      if (!itsMember.discordId) {
        return Ok(null);
      }

      const discordIdResult = DiscordId.create(itsMember.discordId);
      if (discordIdResult.isFailure()) {
        return Err(discordIdResult.getError());
      }

      const memberResult = await this.convertITSMemberToDomainMember(itsMember, discordIdResult.getValue());
      if (memberResult.isFailure()) {
        return Err(memberResult.getError());
      }

      const member = memberResult.getValue();
      this.memberCache.set(member.id.toValue(), member);
      return Ok(member);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Failed to find member by email"));
    }
  }

  async findByStudentNumber(studentNumber: StudentNumber): Promise<Result<Member | null, Error>> {
    try {
      // キャッシュをチェック
      for (const member of this.memberCache.values()) {
        if (member.studentNumber.equals(studentNumber)) {
          return Ok(member);
        }
      }

      // ITSCoreは学籍番号での直接検索をサポートしていないため、
      // ここでは簡易実装でnullを返す
      return Ok(null);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Failed to find member by student number"));
    }
  }

  async delete(id: MemberId): Promise<Result<void, Error>> {
    try {
      this.memberCache.delete(id.toValue());
      return Ok(undefined);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Failed to delete member"));
    }
  }

  private async convertITSMemberToDomainMember(
    itsMember: any,
    discordId: DiscordId
  ): Promise<Result<Member, Error>> {
    try {
      // StudentNumber作成
      const studentNumberResult = StudentNumber.create(itsMember.student_number);
      if (studentNumberResult.isFailure()) {
        return Err(studentNumberResult.getError());
      }

      // Email作成
      const emailResult = Email.create(itsMember.mail);
      if (emailResult.isFailure()) {
        return Err(emailResult.getError());
      }

      // Department作成
      const departmentResult = Department.create(itsMember.department);
      if (departmentResult.isFailure()) {
        return Err(departmentResult.getError());
      }

      // DiscordProfile作成
      const discordProfile = DiscordProfile.create(discordId);

      // Member作成
      const memberProps: MemberProps = {
        name: itsMember.name,
        studentNumber: studentNumberResult.getValue(),
        email: emailResult.getValue(),
        department: departmentResult.getValue(),
        discordProfile: discordProfile,
        status: MemberStatus.DISCORD_REGISTERED // ITSCoreにDiscordIDがあるということは登録済み
      };

      const memberResult = Member.create(memberProps);
      if (memberResult.isFailure()) {
        return Err(memberResult.getError());
      }

      return Ok(memberResult.getValue());
    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Failed to convert ITS member to domain member"));
    }
  }
}