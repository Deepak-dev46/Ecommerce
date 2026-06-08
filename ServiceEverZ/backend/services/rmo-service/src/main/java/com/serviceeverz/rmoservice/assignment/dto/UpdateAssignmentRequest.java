package com.serviceeverz.rmoservice.assignment.dto;

import com.serviceeverz.rmoservice.shared.enums.MembershipType;

public class UpdateAssignmentRequest {

    private MembershipType membershipType;
    private Boolean active;

    public MembershipType getMembershipType() { return membershipType; }
    public void setMembershipType(MembershipType membershipType) { this.membershipType = membershipType; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}