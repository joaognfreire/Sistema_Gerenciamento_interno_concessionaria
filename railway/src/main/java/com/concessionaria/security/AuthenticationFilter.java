package com.concessionaria.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class AuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public AuthenticationFilter(JwtService jwtService, JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jwtService = jwtService;
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return "OPTIONS".equalsIgnoreCase(request.getMethod())
                || "/api/auth/login".equals(request.getRequestURI());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
            if (authorization != null && authorization.startsWith("Bearer ")) {
                String token = authorization.substring("Bearer ".length()).trim();
                var claims = jwtService.verify(token);
                if (claims.isEmpty()) {
                    unauthorized(response, "Sessao invalida ou expirada.");
                    return;
                }

                AuthenticatedUser user = loadActiveUser(claims.get().userId());
                if (user == null) {
                    unauthorized(response, "Usuario inativo ou nao encontrado.");
                    return;
                }
                CurrentUser.set(user);
            }

            filterChain.doFilter(request, response);
        } finally {
            CurrentUser.clear();
        }
    }

    private AuthenticatedUser loadActiveUser(Long userId) {
        var users = jdbcTemplate.query("""
                SELECT c.id_colaborador AS id, c.nome, c.cpf, ca.nome_cargo AS cargo, c.email
                FROM colaborador c
                JOIN cargo ca ON ca.id_cargo = c.id_cargo
                WHERE c.id_colaborador = ? AND c.status = 'Ativo'
                """, (rs, rowNum) -> new AuthenticatedUser(
                rs.getLong("id"),
                rs.getString("nome"),
                rs.getString("cpf"),
                Cargo.fromJson(rs.getString("cargo")),
                rs.getString("email")
        ), userId);

        return users.isEmpty() ? null : users.get(0);
    }

    private void unauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType("application/json");
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", message);
        objectMapper.writeValue(response.getWriter(), body);
    }
}
