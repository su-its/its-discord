export enum MemberStatusType {
  PENDING = "PENDING",
  DISCORD_REGISTERED = "DISCORD_REGISTERED",
  EMAIL_VERIFIED = "EMAIL_VERIFIED",
  AUTHENTICATED = "AUTHENTICATED",
  INACTIVE = "INACTIVE",
}

export class MemberStatus {
  private constructor(private readonly value: MemberStatusType) {}

  static readonly PENDING = new MemberStatus(MemberStatusType.PENDING);
  static readonly DISCORD_REGISTERED = new MemberStatus(
    MemberStatusType.DISCORD_REGISTERED,
  );
  static readonly EMAIL_VERIFIED = new MemberStatus(
    MemberStatusType.EMAIL_VERIFIED,
  );
  static readonly AUTHENTICATED = new MemberStatus(
    MemberStatusType.AUTHENTICATED,
  );
  static readonly INACTIVE = new MemberStatus(MemberStatusType.INACTIVE);

  getValue(): MemberStatusType {
    return this.value;
  }

  isPending(): boolean {
    return this.value === MemberStatusType.PENDING;
  }

  isDiscordRegistered(): boolean {
    return this.value === MemberStatusType.DISCORD_REGISTERED;
  }

  isEmailVerified(): boolean {
    return this.value === MemberStatusType.EMAIL_VERIFIED;
  }

  isAuthenticated(): boolean {
    return this.value === MemberStatusType.AUTHENTICATED;
  }

  isInactive(): boolean {
    return this.value === MemberStatusType.INACTIVE;
  }

  canRegisterDiscord(): boolean {
    return this.isPending();
  }

  canVerifyEmail(): boolean {
    return this.isDiscordRegistered();
  }

  canAuthenticate(): boolean {
    return this.isEmailVerified();
  }

  equals(other: MemberStatus): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
