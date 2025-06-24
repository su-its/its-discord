import { RegisterMemberUseCase } from "../usecases/member/RegisterMemberUseCase";
import { AuthenticateMemberUseCase } from "../usecases/member/AuthenticateMemberUseCase";
import { UpdateMemberNicknameUseCase } from "../usecases/member/UpdateMemberNicknameUseCase";
import { MemberAggregateFactory } from "../../domain/factories/MemberAggregateFactory";
import { MemberAuthenticationService } from "../../domain/services/MemberAuthenticationService";
import { RoleAssignmentService } from "../../domain/services/RoleAssignmentService";
import { NicknameGenerationService } from "../../domain/services/NicknameGenerationService";
import { ITSCoreAdapterImpl } from "../../infrastructure/adapters/ITSCoreAdapterImpl";
import { EmailAuthAdapterImpl } from "../../infrastructure/adapters/EmailAuthAdapterImpl";
import { InMemoryMemberRepository } from "../../infrastructure/repositories/InMemoryMemberRepository";
import { SimpleEventDispatcher } from "../../infrastructure/events/SimpleEventDispatcher";

export class DIContainer {
  private static instance: DIContainer;
  
  // Infrastructure dependencies
  private readonly itsCoreAdapter = new ITSCoreAdapterImpl();
  private readonly emailAuthAdapter = new EmailAuthAdapterImpl();
  private readonly memberRepository = new InMemoryMemberRepository();
  private readonly eventDispatcher = new SimpleEventDispatcher();
  
  // Domain services
  private readonly memberAuthenticationService = new MemberAuthenticationService(this.itsCoreAdapter);
  private readonly roleAssignmentService = new RoleAssignmentService();
  private readonly nicknameGenerationService = new NicknameGenerationService();
  
  // Factories
  private readonly memberAggregateFactory = new MemberAggregateFactory(
    this.memberAuthenticationService,
    this.roleAssignmentService,
    this.nicknameGenerationService,
    this.emailAuthAdapter
  );

  private constructor() {}

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
      this.eventDispatcher
    );
  }

  getAuthenticateMemberUseCase(): AuthenticateMemberUseCase {
    return new AuthenticateMemberUseCase(
      this.memberAggregateFactory,
      this.memberRepository,
      this.eventDispatcher
    );
  }

  getUpdateMemberNicknameUseCase(): UpdateMemberNicknameUseCase {
    return new UpdateMemberNicknameUseCase(
      this.memberAggregateFactory,
      this.memberRepository,
      this.eventDispatcher
    );
  }
}