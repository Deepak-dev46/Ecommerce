package com.serviceeverz.userservice.security;

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

/**
 * Reads X-User-Id, X-User-Email, X-User-Roles headers injected by API Gateway.
 * Sets Spring Security context so @PreAuthorize works correctly.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String userId  = request.getHeader("X-User-Id");
        String email   = request.getHeader("X-User-Email");
        String rolesHdr= request.getHeader("X-User-Roles");

        if (email != null && !email.isBlank()) {
            List<SimpleGrantedAuthority> authorities = Collections.emptyList();
            if (rolesHdr != null && !rolesHdr.isBlank()) {
                authorities = Arrays.stream(rolesHdr.split(","))
                        .map(String::trim)
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());
            }

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(email, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(auth);

            // Inject userId as request attribute for controllers
            if (userId != null && !userId.isBlank()) {
                try { request.setAttribute("userId", Long.parseLong(userId)); }
                catch (NumberFormatException ignored) {}
            }
        }

        chain.doFilter(request, response);
    }
}
