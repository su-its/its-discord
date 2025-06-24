import { Department } from "../valueObjects/Department";
import { Member } from "../entities/NewMember";

export class RoleAssignmentService {
  
  getRequiredRoles(member: Member): string[] {
    const roles: string[] = [];
    
    // 認証済みメンバーの基本ロール
    if (member.status.isAuthenticated()) {
      roles.push("AUTHORIZED");
      
      // 部署ロール
      roles.push(member.department.getRoleName());
      
      // 特別ルール
      if (member.department.isGraduate()) {
        roles.push("GRADUATE_STUDENT");
      }
      
      if (member.department.isAlumni()) {
        roles.push("ALUMNI");
      }
    } else {
      // 未認証メンバーのロール
      roles.push("UNAUTHORIZED");
    }

    return roles;
  }

  getRolesToRemove(member: Member): string[] {
    const rolesToRemove: string[] = [];
    
    if (member.status.isAuthenticated()) {
      // 認証済みなので未認証ロールを削除
      rolesToRemove.push("UNAUTHORIZED");
    }

    return rolesToRemove;
  }

  shouldAssignRole(member: Member, roleName: string): boolean {
    const requiredRoles = this.getRequiredRoles(member);
    return requiredRoles.includes(roleName);
  }

  shouldRemoveRole(member: Member, roleName: string): boolean {
    const rolesToRemove = this.getRolesToRemove(member);
    return rolesToRemove.includes(roleName);
  }
}