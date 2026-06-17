package com.serviceeverz.rmoservice.config;
 
import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
 
@Component
public class FeignAuthInterceptor implements RequestInterceptor {
 
    @Override
    public void apply(RequestTemplate template) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            template.header("X-User-Email", auth.getName());
 
            // Pass roles as comma-separated string
            String roles = auth.getAuthorities().stream()
                    .map(a -> a.getAuthority())
                    .collect(java.util.stream.Collectors.joining(","));
            template.header("X-User-Roles", roles);
        }
    }
}
 