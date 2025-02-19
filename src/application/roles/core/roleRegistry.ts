import type Role from "../../../domain/types/role";

export default class RoleRegistry {
  private roles: Map<string, Role> = new Map();

  /**
   * ロールを登録する
   * @param {Role} role Role インターフェースを実装したロール
   */
  public register(role: Role): void {
    if (this.roles.has(role.name)) {
      throw new Error(`Role ${role.name} already registered`);
    }
    this.roles.set(role.name, role);
  }

  /**
   * ロールの配列をまとめて登録する
   * @param {Role[]} roles 登録するロールの配列
   */
  public registerRoles(roles: Role[]): void {
    for (const role of roles) {
      this.register(role);
    }
  }

  /**
   * ロール名からロールを取得する
   * @param {string} name 登録されたロール名
   * @returns {Role | undefined}
   */
  public getRole(name: string): Role {
    const role = this.roles.get(name);
    if (!role) {
      throw new Error(`Role ${name} not found`);
    }
    return role;
  }

  /**
   * 登録されたすべてのロールを取得する
   * @returns {Role[]}
   */
  public getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }
}
