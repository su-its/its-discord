import { Entity } from "../common/Entity";
import { DiscordId } from "../valueObjects/ids/DiscordId";

export class DiscordProfile extends Entity<DiscordId> {
  private _nickname: string | null;
  private _roles: string[];

  private constructor(
    discordId: DiscordId,
    nickname: string | null = null,
    roles: string[] = []
  ) {
    super(discordId);
    this._nickname = nickname;
    this._roles = [...roles];
  }

  static create(discordId: DiscordId): DiscordProfile {
    return new DiscordProfile(discordId);
  }

  static restore(
    discordId: DiscordId,
    nickname: string | null,
    roles: string[]
  ): DiscordProfile {
    return new DiscordProfile(discordId, nickname, roles);
  }

  get discordId(): DiscordId {
    return this._id;
  }

  get nickname(): string | null {
    return this._nickname;
  }

  get roles(): readonly string[] {
    return this._roles;
  }

  updateNickname(nickname: string): void {
    this._nickname = nickname;
  }

  assignRole(roleName: string): void {
    if (!this._roles.includes(roleName)) {
      this._roles.push(roleName);
    }
  }

  removeRole(roleName: string): void {
    this._roles = this._roles.filter(role => role !== roleName);
  }

  hasRole(roleName: string): boolean {
    return this._roles.includes(roleName);
  }

  clearRoles(): void {
    this._roles = [];
  }
}