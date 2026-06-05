package com.serviceeverz.rmoservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Collections;
import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger LOG = Logger.getLogger(JwtAuthFilter.class.getName());

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // ── Try Bearer token first ──
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(key)
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                String email = claims.getSubject();
                Long userId = claims.get("userId", Long.class);
                List<String> roles = claims.get("roles", List.class);

                if (roles == null) {
                    roles = Collections.emptyList();
                }

                List<SimpleGrantedAuthority> authorities = roles.stream()
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(email, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(auth);

                if (userId != null) {
                    request.setAttribute("userId", userId);
                }

                LOG.info("JWT Auth: email=" + email + ", userId=" + userId + ", roles=" + roles);

            } catch (Exception e) {
                LOG.warning("JWT parsing failed: " + e.getMessage());
                SecurityContextHolder.clearContext();
            }

            chain.doFilter(request, response);
            return;
        }

        // ── Fallback: X-User-* headers (for inter-service Feign calls) ──
        String email = request.getHeader("X-User-Email");
        String userIdStr = request.getHeader("X-User-Id");
        String rolesHdr = request.getHeader("X-User-Roles");

        if (email != null && !email.isBlank()) {
            List<SimpleGrantedAuthority> authorities = Collections.emptyList();
            if (rolesHdr != null && !rolesHdr.isBlank()) {
                authorities = java.util.Arrays.stream(rolesHdr.split(","))
                        .map(String::trim)
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());
            }

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(email, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(auth);

            if (userIdStr != null && !userIdStr.isBlank()) {
                try { request.setAttribute("userId", Long.parseLong(userIdStr)); }
                catch (NumberFormatException ignored) {}
            }
        }

        chain.doFilter(request, response);
    }
}