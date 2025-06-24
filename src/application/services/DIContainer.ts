import { MemberAggregateFactory } from "../../domain/factories/MemberAggregateFactory";
import { MemberAuthenticationService } from "../../domain/services/MemberAuthenticationService";
import { NicknameGenerationService } from "../../domain/services/NicknameGenerationService";
import { RoleAssignmentService } from "../../domain/services/RoleAssignmentService";
import { EmailAuthAdapterImpl } from "../../infrastructure/adapters/EmailAuthAdapterImpl";
import { ITSCoreAdapterImpl } from "../../infrastructure/adapters/ITSCoreAdapterImpl";
import { SimpleEventDispatcher } from "../../infrastructure/events/SimpleEventDispatcher";
import { ITSCoreMemberRepository } from "../../infrastructure/repositories/ITSCoreMemberRepository";
import { MemberAuthenticatedHandler } from "../handlers/MemberAuthenticatedHandler";
import { MemberJoinedGuildHandler } from "../handlers/MemberJoinedGuildHandler";
import { MemberNicknameChangedHandler } from "../handlers/MemberNicknameChangedHandler";
import { MemberRoleAssignedHandler } from "../handlers/MemberRoleAssignedHandler";
import { AuthenticateMemberUseCase } from "../usecases/member/AuthenticateMemberUseCase";
import { HandleMemberJoinUseCase } from "../usecases/member/HandleMemberJoinUseCase";
import { RegisterMemberUseCase } from "../usecases/member/RegisterMemberUseCase";
import { RenameAllMembersUseCase } from "../usecases/member/RenameAllMembersUseCase";
import { UpdateMemberNicknameUseCase } from "../usecases/member/UpdateMemberNicknameUseCase";

export class DIContainer {
  private static instance: DIContainer;

  // Infrastructure dependencies
  private readonly itsCoreAdapter = new ITSCoreAdapterImpl();
  private readonly emailAuthAdapter = new EmailAuthAdapterImpl();
  private readonly memberRepository = new ITSCoreMemberRepository();
  private readonly eventDispatcher = new SimpleEventDispatcher();

  // Domain services
  private readonly memberAuthenticationService =
    new MemberAuthenticationService(this.itsCoreAdapter);
  private readonly roleAssignmentService = new RoleAssignmentService();
  private readonly nicknameGenerationService = new NicknameGenerationService();

  // Factories
  private readonly memberAggregateFactory = new MemberAggregateFactory(
    this.memberAuthenticationService,
    this.roleAssignmentService,
    this.nicknameGenerationService,
    this.emailAuthAdapter,
  );

  private constructor() {
    // イベントハンドラーは初期化時に登録する
    // guildIdは後で設定される予定
  }

  setupEventHandlers(guildId: string): void {
    // ドメインイベントハンドラーを登録
    this.eventDispatcher.register(
      "MemberAuthenticated",
      new MemberAuthenticatedHandler(guildId),
    );

    this.eventDispatcher.register(
      "MemberRoleAssigned",
      new MemberRoleAssignedHandler(guildId),
    );

    this.eventDispatcher.register(
      "MemberNicknameChanged",
      new MemberNicknameChangedHandler(guildId),
    );

    this.eventDispatcher.register(
      "MemberJoinedGuild",
      new MemberJoinedGuildHandler(guildId),
    );
  }

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  getRegisterMemberUseCase(): RegisterMemberUseCase {
    return new RegisterMemberUseCase(
      this.memberAggregateFactory,
      this.memberRepository,
      this.eventDispatcher,
    );
  }

  getAuthenticateMemberUseCase(): AuthenticateMemberUseCase {
    return new AuthenticateMemberUseCase(
      this.memberAggregateFactory,
      this.memberRepository,
      this.eventDispatcher,
    );
  }

  getUpdateMemberNicknameUseCase(): UpdateMemberNicknameUseCase {
    return new UpdateMemberNicknameUseCase(
      this.memberAggregateFactory,
      this.memberRepository,
      this.eventDispatcher,
    );
  }

  getRenameAllMembersUseCase(): RenameAllMembersUseCase {
    return new RenameAllMembersUseCase(
      this.memberRepository,
      this.memberAggregateFactory,
      this.itsCoreAdapter,
      this.eventDispatcher,
    );
  }

  getHandleMemberJoinUseCase(): HandleMemberJoinUseCase {
    return new HandleMemberJoinUseCase(this.eventDispatcher);
  }
}
