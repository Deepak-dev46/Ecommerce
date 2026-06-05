package com.serviceeverz.authservice.service;
 
import com.serviceeverz.authservice.dto.LoginRequest;
import com.serviceeverz.authservice.dto.LoginResponse;
import com.serviceeverz.authservice.entity.LoginAudit;
import com.serviceeverz.authservice.repository.LoginAuditRepository;
import org.springframework.stereotype.Service;
 
@Service
public class AuthService {
 
    private final LoginAuditRepository repo;
 
    public AuthService(LoginAuditRepository repo) {
        this.repo = repo;
    }
 
    public LoginResponse login(LoginRequest req) {
        LoginAudit a = new LoginAudit();
        a.setEmail(req.getEmail());
        a.setSuccess(true);
        repo.save(a);
 
        LoginResponse response = new LoginResponse();
        response.setToken("mock-jwt-token");
        response.setMessage("Login successful");
        return response;
    }
}