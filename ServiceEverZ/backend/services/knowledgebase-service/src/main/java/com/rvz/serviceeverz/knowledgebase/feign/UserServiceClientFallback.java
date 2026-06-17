package com.rvz.serviceeverz.knowledgebase.feign;

import org.springframework.stereotype.Component;

@Component
public class UserServiceClientFallback implements UserServiceClient {
 
    @Override
    public Boolean userExists(Long userId) {
        return true;
    }
 
    @Override
    public String getUserName(Long userId) {
        return "User-" + userId;
    }
}
