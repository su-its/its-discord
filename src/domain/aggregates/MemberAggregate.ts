import type { DomainEvent } from "../common/DomainEvent";
import { Err, Ok, type Result } from "../common/Result";
import { Member, type MemberProps } from "../entities/NewMember";
import type { EmailAuthAdapter } from "../services/EmailAuthAdapter";
import type { MemberAuthenticationService } from "../services/MemberAuthenticationService";
import type { NicknameGenerationService } from "../services/NicknameGenerationService";
import type { RoleAssignmentService } from "../services/RoleAssignmentService";
import { Department } from "../valueObjects/Department";
import { Email } from "../valueObjects/Email";
import { StudentNumber } from "../valueObjects/StudentNumber";
import type { DiscordId } from "../valueObjects/ids/DiscordId";
import { MemberId } from "../valueObjects/ids/MemberId";

export class MemberAggregate {
  constructor(
    private readonly member: Member,
    private readonly authenticationService: MemberAuthenticationService,
    private readonly roleAssignmentService: RoleAssignmentService,
    private readonly nicknameGenerationService: NicknameGenerationService,
    private readonly emailAuthAdapter: EmailAuthAdapter,
  ) {}

  static async createNewMember(
    props: MemberProps,
    authenticationService: MemberAuthenticationService,
    roleAssignmentService: RoleAssignmentService,
    nicknameGenerationService: NicknameGenerationService,
    emailAuthAdapter: EmailAuthAdapter,
  ): Promise<Result<MemberAggregate, Error>> {
    // メンバー情報の検証
    const verificationResult =
      await authenticationService.verifyMemberCredentials(
        props.name,
        props.studentNumber,
        props.email,
        props.department,
      );

    if (verificationResult.isFailure()) {
      return Err(verificationResult.getError());
    }

    if (!verificationResult.getValue()) {
      return Err(new Error("Member credentials not found in ITS Core"));
    }

    // メンバーエンティティの作成
    const memberResult = Member.create(props);
    if (memberResult.isFailure()) {
      return Err(memberResult.getError());
    }

    const member = memberResult.getValue();

    return Ok(
      new MemberAggregate(
        member,
        authenticationService,
        roleAssignmentService,
        nicknameGenerationService,
        emailAuthAdapter,
      ),
    );
  }

  static restore(
    member: Member,
    authenticationService: MemberAuthenticationService,
    roleAssignmentService: RoleAssignmentService,
    nicknameGenerationService: NicknameGenerationService,
    emailAuthAdapter: EmailAuthAdapter,
  ): MemberAggregate {
    return new MemberAggregate(
      member,
      authenticationService,
      roleAssignmentService,
      nicknameGenerationService,
      emailAuthAdapter,
    );
  }

  async completeRegistration(
    discordId: DiscordId,
  ): Promise<Result<DomainEvent[], Error>> {
    try {
      // Discord アカウント登録
      const registerResult = this.member.registerDiscordAccount(discordId);
      if (registerResult.isFailure()) {
        return Err(registerResult.getError());
      }

      // メール認証送信
      const emailResult = await this.emailAuthAdapter.sendAuthEmail(
        this.member.email,
        this.member.studentNumber,
        this.member.department,
      );

      if (emailResult.isFailure()) {
        return Err(emailResult.getError());
      }

      // 現在までのドメインイベントを取得
      const events = [...this.member.domainEvents];
      return Ok(events);
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Registration failed"),
      );
    }
  }

  async completeAuthentication(): Promise<Result<DomainEvent[], Error>> {
    try {
      // メール認証確認
      const emailVerified = await this.emailAuthAdapter.verifyEmailAuth(
        this.member.email,
      );
      if (emailVerified.isFailure()) {
        return Err(emailVerified.getError());
      }

      if (!emailVerified.getValue()) {
        return Err(new Error("Email not verified"));
      }

      // メール認証完了
      const verifyResult = this.member.verifyEmail();
      if (verifyResult.isFailure()) {
        return Err(verifyResult.getError());
      }

      // 認証完了
      const authResult = this.member.authenticate();
      if (authResult.isFailure()) {
        return Err(authResult.getError());
      }

      // 必要なロールを取得・割り当て
      const requiredRoles = this.roleAssignmentService.getRequiredRoles(
        this.member,
      );
      for (const role of requiredRoles) {
        const roleResult = this.member.assignRole(role);
        if (roleResult.isFailure()) {
          return Err(roleResult.getError());
        }
      }

      // ニックネーム生成・設定
      const nicknameResult = this.nicknameGenerationService.generateNickname(
        this.member,
      );
      if (nicknameResult.isSuccess()) {
        const updateResult = this.member.updateNickname(
          nicknameResult.getValue(),
        );
        if (updateResult.isFailure()) {
          return Err(updateResult.getError());
        }
      }

      // 現在までのドメインイベントを取得
      const events = [...this.member.domainEvents];
      return Ok(events);
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Authentication failed"),
      );
    }
  }

  updateNickname(newNickname: string): Result<DomainEvent[], Error> {
    // ニックネーム検証
    const validationResult =
      this.nicknameGenerationService.validateNickname(newNickname);
    if (validationResult.isFailure()) {
      return Err(validationResult.getError());
    }

    // ニックネーム更新
    const updateResult = this.member.updateNickname(newNickname);
    if (updateResult.isFailure()) {
      return Err(updateResult.getError());
    }

    // ドメインイベントを取得
    const events = [...this.member.domainEvents];
    return Ok(events);
  }

  getMember(): Member {
    return this.member;
  }

  getDomainEvents(): DomainEvent[] {
    return this.member.domainEvents;
  }

  clearEvents(): void {
    this.member.clearEvents();
  }
}
