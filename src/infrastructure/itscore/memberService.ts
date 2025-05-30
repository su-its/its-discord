import { createMemberUseCases } from "@shizuoka-its/core";
import type {
  ITSCorePort,
  MemberConnectionData,
  MemberRegistrationData,
} from "../../application/ports/itsCorePort";
import type InternalMember from "../../domain/entities/member";
import { toInternalMember } from "./mapper";

/**
 * ITSCoreのメンバー機能へのアクセスを提供するAdapter（ヘキサゴナルアーキテクチャ）
 * YAGNIの原則に従い、実際に使用される機能のみを公開
 * ITSCoreのモデルを内部モデルに変換して返す責務も持つ
 */
export class ITSCoreMemberRepository implements ITSCorePort {
  private useCases = createMemberUseCases();

  /**
   * 新しいメンバーを登録する
   */
  async registerMember(data: MemberRegistrationData): Promise<void> {
    await this.useCases.registerMember.execute(data);
  }

  /**
   * DiscordIDでメンバーを取得する
   */
  async getMemberByDiscordId(
    discordId: string,
  ): Promise<InternalMember | undefined> {
    const result = await this.useCases.getMemberByDiscordId.execute({
      discordId,
    });
    return result.member ? toInternalMember(result.member) : undefined;
  }

  /**
   * メールアドレスでメンバーを取得する
   */
  async getMemberByEmail(email: string): Promise<InternalMember | undefined> {
    const result = await this.useCases.getMemberByEmail.execute({ email });
    return result.member ? toInternalMember(result.member) : undefined;
  }

  /**
   * DiscordアカウントとITSCoreアカウントを紐づける
   */
  async connectDiscordAccount(data: MemberConnectionData): Promise<void> {
    await this.useCases.connectDiscordAccount.execute(data);
  }

  /**
   * 全メンバーのリストを取得する
   */
  async getMemberList(): Promise<InternalMember[]> {
    const result = await this.useCases.getMemberList.execute({});
    return result.members.map((member) => toInternalMember(member));
  }
}

// シングルトンとしてエクスポート
export const itsCoreMemberRepository = new ITSCoreMemberRepository();
