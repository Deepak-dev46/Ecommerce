package com.serviceeverz.rmoservice.assignment.dto;

import com.serviceeverz.rmoservice.shared.enums.MembershipType;
import jakarta.validation.constraints.NotNull;

public class MemberAssignment {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Membership type is required")
    private MembershipType membershipType;

    public MemberAssignment() {}

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public MembershipType getMembershipType() { return membershipType; }
    public void setMembershipType(MembershipType membershipType) { this.membershipType = membershipType; }
}