package com.serviceeverz.userservice.passwordpolicy.service;

import com.serviceeverz.userservice.passwordpolicy.dto.*;
import com.serviceeverz.userservice.passwordpolicy.entity.PasswordPolicy;

public interface IPasswordPolicyService {
	PasswordPolicyResponse savePolicy(PasswordPolicyRequest req);

	PasswordPolicyResponse getPolicy();
	
	PasswordPolicy getActivePolicy();
}