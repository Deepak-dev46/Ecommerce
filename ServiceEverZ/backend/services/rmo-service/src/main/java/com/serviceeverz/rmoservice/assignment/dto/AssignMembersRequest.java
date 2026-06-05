package com.serviceeverz.rmoservice.assignment.dto;
 
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
 
public class AssignMembersRequest {
 
    @NotEmpty(message = "At least one member is required")
    @Valid
    private List<MemberAssignment> members;
 
    public List<MemberAssignment> getMembers() { return members; }
    public void setMembers(List<MemberAssignment> members) { this.members = members; }
}