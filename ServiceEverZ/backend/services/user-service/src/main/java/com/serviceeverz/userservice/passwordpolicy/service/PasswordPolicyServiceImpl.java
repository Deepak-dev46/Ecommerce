package com.serviceeverz.userservice.passwordpolicy.service;

import com.serviceeverz.userservice.passwordpolicy.dto.*;
import com.serviceeverz.userservice.passwordpolicy.entity.PasswordPolicy;
import com.serviceeverz.userservice.passwordpolicy.repository.PasswordPolicyRepository;
import org.springframework.stereotype.Service;

@Service
public class PasswordPolicyServiceImpl implements IPasswordPolicyService {
	private final PasswordPolicyRepository repo;

	public PasswordPolicyServiceImpl(PasswordPolicyRepository repo) {
		this.repo = repo;
	}

	public PasswordPolicyResponse savePolicy(PasswordPolicyRequest req) {
		PasswordPolicy p = repo.findAll().stream().findFirst().orElse(new PasswordPolicy());
		p.setMinLength(req.getMinLength());
		p.setRequireUppercase(req.isRequireUppercase());
		p.setRequireLowercase(req.isRequireLowercase());
		p.setRequireDigit(req.isRequireDigit());
		p.setRequireSpecialChar(req.isRequireSpecialChar());
		p.setPasswordExpiryDays(req.getPasswordExpiryDays());
		p.setPasswordHistoryCount(req.getPasswordHistoryCount());
		p.setMaxFailedAttempts(req.getMaxFailedAttempts());
		p.setLockoutDurationMinutes(req.getLockoutDurationMinutes());
		return PasswordPolicyResponse.from(repo.save(p));
	}

	public PasswordPolicyResponse getPolicy() {
		return repo.findAll().stream().findFirst().map(PasswordPolicyResponse::from)
				.orElseGet(() -> PasswordPolicyResponse.from(repo.save(new PasswordPolicy())));
	}

	@Override
	public PasswordPolicy getActivePolicy() {
		// TODO Auto-generated method stub
		return repo.findAll().stream().findFirst().orElseGet(() -> repo.save(new PasswordPolicy()));
	}
	
}