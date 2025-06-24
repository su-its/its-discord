import { Result, Ok, Err } from "../../domain/common/Result";
import { ITSCoreAdapter, ITSCoreMember, MemberCredentials } from "../../domain/services/ITSCoreAdapter";
import { itsCoreService } from "../../application/services/itsCoreService";

export class ITSCoreAdapterImpl implements ITSCoreAdapter {
  async findMember(credentials: MemberCredentials): Promise<Result<ITSCoreMember | null, Error>> {
    try {
      const members = await itsCoreService.getMemberList();
      
      const matchingMember = members.find((member) => {
        return (
          member.name === credentials.name &&
          member.student_number === credentials.studentNumber.getValue() &&
          member.mail === credentials.email.getValue() &&
          member.department === credentials.department.toString()
        );
      });

      if (matchingMember) {
        const itsMember: ITSCoreMember = {
          name: matchingMember.name,
          studentNumber: matchingMember.student_number,
          email: matchingMember.mail,
          department: matchingMember.department
        };
        return Ok(itsMember);
      }

      return Ok(null);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Failed to find member"));
    }
  }

  async getAllMembers(): Promise<Result<ITSCoreMember[], Error>> {
    try {
      const members = await itsCoreService.getMemberList();
      
      const itsMembers: ITSCoreMember[] = members.map(member => ({
        name: member.name,
        studentNumber: member.student_number,
        email: member.mail,
        department: member.department
      }));

      return Ok(itsMembers);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Failed to get all members"));
    }
  }
}