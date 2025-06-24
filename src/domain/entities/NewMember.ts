import { AggregateRoot } from "../common/AggregateRoot";
import { Err, Ok, type Result } from "../common/Result";
import { MemberAuthenticated } from "../events/MemberAuthenticated";
import { MemberDiscordRegistered } from "../events/MemberDiscordRegistered";
import { MemberEmailVerified } from "../events/MemberEmailVerified";
import { MemberNicknameChanged } from "../events/MemberNicknameChanged";
import { MemberRegistered } from "../events/MemberRegistered";
import { MemberRoleAssigned } from "../events/MemberRoleAssigned";
import type { Department } from "../valueObjects/Department";
import type { Email } from "../valueObjects/Email";
import { MemberStatus } from "../valueObjects/MemberStatus";
import type { StudentNumber } from "../valueObjects/StudentNumber";
import type { DiscordId } from "../valueObjects/ids/DiscordId";
import { MemberId } from "../valueObjects/ids/MemberId";
import { DiscordProfile } from "./DiscordProfile";

export interface MemberProps {
  name: string;
  studentNumber: StudentNumber;
  email: Email;
  department: Department;
  discordProfile?: DiscordProfile;
  status?: MemberStatus;
}

export class Member extends AggregateRoot<MemberId> {
  private _name: string;
  private readonly _studentNumber: StudentNumber;
  private readonly _email: Email;
  private readonly _department: Department;
  private _discordProfile: DiscordProfile | null;
  private _status: MemberStatus;

  private constructor(id: MemberId, props: MemberProps) {
    super(id);
    this._name = props.name;
    this._studentNumber = props.studentNumber;
    this._email = props.email;
    this._department = props.department;
    this._discordProfile = props.discordProfile || null;
    this._status = props.status || MemberStatus.PENDING;
  }

  static create(props: MemberProps): Result<Member, Error> {
    if (!props.name || props.name.trim().length === 0) {
      return Err(new Error("Member name cannot be empty"));
    }

    const id = MemberId.generate();
    const member = new Member(id, props);

    // ドメインイベントを発行
    member.addDomainEvent(
      new MemberRegistered(
        id,
        props.name,
        props.studentNumber,
        props.email,
        props.department,
      ),
    );

    return Ok(member);
  }

  static restore(id: MemberId, props: MemberProps): Member {
    return new Member(id, props);
  }

  get name(): string {
    return this._name;
  }

  get studentNumber(): StudentNumber {
    return this._studentNumber;
  }

  get email(): Email {
    return this._email;
  }

  get department(): Department {
    return this._department;
  }

  get discordProfile(): DiscordProfile | null {
    return this._discordProfile;
  }

  get status(): MemberStatus {
    return this._status;
  }

  registerDiscordAccount(discordId: DiscordId): Result<void, Error> {
    if (this._discordProfile) {
      return Err(new Error("Discord account already registered"));
    }

    if (!this._status.canRegisterDiscord()) {
      return Err(
        new Error(`Cannot register Discord account in status: ${this._status}`),
      );
    }

    this._discordProfile = DiscordProfile.create(discordId);
    this._status = MemberStatus.DISCORD_REGISTERED;

    // ドメインイベントを発行
    this.addDomainEvent(new MemberDiscordRegistered(this._id, discordId));

    return Ok(undefined);
  }

  verifyEmail(): Result<void, Error> {
    if (!this._status.canVerifyEmail()) {
      return Err(new Error(`Cannot verify email in status: ${this._status}`));
    }

    this._status = MemberStatus.EMAIL_VERIFIED;

    // ドメインイベントを発行
    this.addDomainEvent(new MemberEmailVerified(this._id, this._email));

    return Ok(undefined);
  }

  authenticate(): Result<void, Error> {
    if (!this._discordProfile) {
      return Err(new Error("Discord account not registered"));
    }

    if (!this._status.canAuthenticate()) {
      return Err(new Error(`Cannot authenticate in status: ${this._status}`));
    }

    this._status = MemberStatus.AUTHENTICATED;

    // ドメインイベントを発行
    this.addDomainEvent(
      new MemberAuthenticated(this._id, this._discordProfile.discordId),
    );

    return Ok(undefined);
  }

  updateNickname(nickname: string): Result<void, Error> {
    if (!this._discordProfile) {
      return Err(new Error("Discord account not registered"));
    }

    if (!nickname || nickname.trim().length === 0) {
      return Err(new Error("Nickname cannot be empty"));
    }

    const oldNickname = this._discordProfile.nickname;
    this._discordProfile.updateNickname(nickname.trim());

    // ドメインイベントを発行
    this.addDomainEvent(
      new MemberNicknameChanged(
        this._id,
        this._discordProfile.discordId,
        oldNickname,
        nickname.trim(),
      ),
    );

    return Ok(undefined);
  }

  assignRole(roleName: string): Result<void, Error> {
    if (!this._discordProfile) {
      return Err(new Error("Discord account not registered"));
    }

    if (!this._status.isAuthenticated()) {
      return Err(new Error("Member must be authenticated to assign roles"));
    }

    this._discordProfile.assignRole(roleName);

    // ドメインイベントを発行
    this.addDomainEvent(
      new MemberRoleAssigned(
        this._id,
        this._discordProfile.discordId,
        roleName,
      ),
    );

    return Ok(undefined);
  }

  removeRole(roleName: string): Result<void, Error> {
    if (!this._discordProfile) {
      return Err(new Error("Discord account not registered"));
    }

    this._discordProfile.removeRole(roleName);
    return Ok(undefined);
  }

  getRequiredRoles(): string[] {
    const roles: string[] = [];

    if (this._status.isAuthenticated()) {
      roles.push("AUTHORIZED");
      roles.push(this._department.getRoleName());
    }

    return roles;
  }

  canBeAuthenticated(): boolean {
    return this._discordProfile !== null && this._status.canAuthenticate();
  }

  changeName(newName: string): Result<void, Error> {
    if (!newName || newName.trim().length === 0) {
      return Err(new Error("Name cannot be empty"));
    }

    this._name = newName.trim();
    return Ok(undefined);
  }
}
