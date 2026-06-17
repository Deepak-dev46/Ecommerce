package com.serviceeverz.authservice.service;

import com.serviceeverz.authservice.dto.LoginRequest;
import com.serviceeverz.authservice.dto.LoginResponse;

public interface IAuthService {
    LoginResponse login(LoginRequest request);
}
