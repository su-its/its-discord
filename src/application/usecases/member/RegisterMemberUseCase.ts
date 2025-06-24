import { Result, Ok, Err } from "../../../domain/common/Result";
import { UseCase } from "../../common/UseCase";
import { EventDispatcher } from "../../common/DomainEventHandler";
import { MemberAggregateFactory } from "../../../domain/factories/MemberAggregateFactory";
import { MemberRepository } from "../../../domain/repositories/MemberRepository";
import { StudentNumber } from "../../../domain/valueObjects/StudentNumber";
import { Email } from "../../../domain/valueObjects/Email";
import { Department } from "../../../domain/valueObjects/Department";
import { DiscordId } from "../../../domain/valueObjects/ids/DiscordId";

export interface RegisterMemberRequest {
  name: string;
  studentNumber: string;
  email: string;
  department: string;
  discordId: string;
}

export interface RegisterMemberResponse {
  memberId: string;
  message: string;
}

export class RegisterMemberUseCase implements UseCase<RegisterMemberRequest, RegisterMemberResponse> {
  constructor(
    private readonly memberAggregateFactory: MemberAggregateFactory,
    private readonly memberRepository: MemberRepository,
    private readonly eventDispatcher: EventDispatcher
  ) {}

  async execute(request: RegisterMemberRequest): Promise<Result<RegisterMemberResponse, Error>> {
    try {
      // バリューオブジェクトの作成
      const studentNumberResult = StudentNumber.create(request.studentNumber);
      if (studentNumberResult.isFailure()) {
        return Err(studentNumberResult.getError());
      }

      const emailResult = Email.create(request.email);
      if (emailResult.isFailure()) {
        return Err(emailResult.getError());
      }

      const departmentResult = Department.create(request.department);
      if (departmentResult.isFailure()) {
        return Err(departmentResult.getError());
      }

      const discordIdResult = DiscordId.create(request.discordId);
      if (discordIdResult.isFailure()) {
        return Err(discordIdResult.getError());
      }

      // 既存チェック
      const existingMemberByEmail = await this.memberRepository.findByEmail(emailResult.getValue());
      if (existingMemberByEmail.isFailure()) {
        return Err(existingMemberByEmail.getError());
      }
      if (existingMemberByEmail.getValue()) {
        return Err(new Error("Member with this email already exists"));
      }

      const existingMemberByDiscord = await this.memberRepository.findByDiscordId(discordIdResult.getValue());
      if (existingMemberByDiscord.isFailure()) {
        return Err(existingMemberByDiscord.getError());
      }
      if (existingMemberByDiscord.getValue()) {
        return Err(new Error("Member with this Discord ID already exists"));
      }

      // メンバー集約の作成
      const memberAggregateResult = await this.memberAggregateFactory.createNew({
        name: request.name,
        studentNumber: studentNumberResult.getValue(),
        email: emailResult.getValue(),
        department: departmentResult.getValue()
      });

      if (memberAggregateResult.isFailure()) {
        return Err(memberAggregateResult.getError());
      }

      const memberAggregate = memberAggregateResult.getValue();

      // Discord登録と認証メール送信
      const registrationResult = await memberAggregate.completeRegistration(discordIdResult.getValue());
      if (registrationResult.isFailure()) {
        return Err(registrationResult.getError());
      }

      // 永続化
      const saveResult = await this.memberRepository.save(memberAggregate.getMember());
      if (saveResult.isFailure()) {
        return Err(saveResult.getError());
      }

      // ドメインイベント発行
      const events = registrationResult.getValue();
      await this.eventDispatcher.dispatch(events);

      // イベントクリア
      memberAggregate.clearEvents();

      return Ok({
        memberId: memberAggregate.getMember().id.toValue(),
        message: "認証メールを送信しました。メールを確認して認証を完了してください。"
      });

    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Unknown error occurred"));
    }
  }
}