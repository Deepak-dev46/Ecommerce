package com.serviceeverz.roleservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
        String email = request.getHeader("X-User-Email");
        String rolesHdr = request.getHeader("X-User-Roles");
        if (email != null && !email.isBlank()) {
            List<SimpleGrantedAuthority> authorities = Collections.emptyList();
            if (rolesHdr != null && !rolesHdr.isBlank()) {
                authorities = Arrays.stream(rolesHdr.split(",")).map(String::trim).map(SimpleGrantedAuthority::new).collect(Collectors.toList());
            }
            SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(email, null, authorities));
        }
        chain.doFilter(request, response);
    }
}
