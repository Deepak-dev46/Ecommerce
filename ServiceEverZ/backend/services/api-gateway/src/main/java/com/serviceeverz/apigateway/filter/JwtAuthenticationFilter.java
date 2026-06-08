package com.serviceeverz.apigateway.filter;
 
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
 
import java.nio.charset.StandardCharsets;
import java.util.List;
 
/**
* Gateway-level JWT filter.
* - Validates the Bearer token on every protected route.
* - Injects X-User-Id, X-User-Email, X-User-Roles headers for downstream services.
* - Downstream services trust these headers (they are NOT publicly reachable).
*/
@Component
public class JwtAuthenticationFilter
        extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {
 
    @Value("${jwt.secret}")
    private String secret;
 
    public JwtAuthenticationFilter() {
        super(Config.class);
    }
 
    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
 
            ServerHttpRequest request = exchange.getRequest();
            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
 
            // ── 1. Check header presence ──────────────────────────────
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange.getResponse(),
                        HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
            }
 
            try {
                // ── 2. Parse & validate JWT ───────────────────────────
                String token = authHeader.substring(7);
                Claims claims = Jwts.parser()
                	    .verifyWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                	    .build()
                	    .parseSignedClaims(token)
                	    .getPayload();
 
 
                // ── 3. Extract claims ─────────────────────────────────
                Long userId  = claims.get("userId", Long.class);
                List<?> roles = claims.get("roles", List.class);
 
                String rolesStr = (roles != null)
                        ? String.join(",", roles.stream().map(Object::toString).toList())
                        : "";
 
                // ── 4. Inject headers for downstream ──────────────────
                ServerHttpRequest mutatedRequest = request.mutate()
                        .header("X-User-Id",    userId != null ? userId.toString() : "")
                        .header("X-User-Email", claims.getSubject())
                        .header("X-User-Roles", rolesStr)
                        .build();
 
                return chain.filter(exchange.mutate().request(mutatedRequest).build());
 
            } catch (Exception e) {
                return onError(exchange.getResponse(),
                        HttpStatus.UNAUTHORIZED, "Invalid or expired JWT token");
            }
        };
    }
 
    // ── Helper: write JSON error response ────────────────────────────
    private Mono<Void> onError(ServerHttpResponse response, HttpStatus status, String message) {
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        String body = String.format(
        	    "{\"status\":%d,\"error\":\"%s\",\"message\":\"%s\"}",
        	    status.value(),
        	    status.getReasonPhrase(),
        	    message
        	);
        DataBuffer buffer = response.bufferFactory()
                .wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }
 
    // ── Required inner Config class for AbstractGatewayFilterFactory ─
    public static class Config {}
}