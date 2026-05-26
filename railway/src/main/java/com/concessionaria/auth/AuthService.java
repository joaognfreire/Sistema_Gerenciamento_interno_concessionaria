package com.concessionaria.auth;

import com.concessionaria.common.ApiException;
import com.concessionaria.security.AuthenticatedUser;
import com.concessionaria.security.Cargo;
import com.concessionaria.security.CurrentUser;
import com.concessionaria.security.JwtService;
import com.concessionaria.security.PasswordService;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {
    private final JdbcTemplate jdbcTemplate;
    private final PasswordService passwordService;
    private final JwtService jwtService;

    public AuthService(JdbcTemplate jdbcTemplate, PasswordService passwordService, JwtService jwtService) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordService = passwordService;
        this.jwtService = jwtService;
    }

    public AuthDtos.LoginResponse login(AuthDtos.LoginRequest request) {
        ColaboradorAuth colaborador = findByCpf(request.cpf())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "CPF ou senha invalidos."));

        if (!Boolean.TRUE.equals(colaborador.ativo())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Colaborador inativo. Fale com um responsavel.");
        }

        if (!passwordService.matches(request.senha(), colaborador.senhaHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "CPF ou senha invalidos.");
        }

        if (passwordService.needsUpgrade(colaborador.senhaHash())) {
            jdbcTemplate.update("UPDATE colaborador SET senha = ? WHERE id_colaborador = ?",
                    passwordService.encode(request.senha()), colaborador.id());
        }

        AuthenticatedUser authenticatedUser = new AuthenticatedUser(
                colaborador.id(),
                colaborador.nome(),
                colaborador.cpf(),
                colaborador.cargo(),
                colaborador.email()
        );
        JwtService.Token token = jwtService.createToken(authenticatedUser);

        return new AuthDtos.LoginResponse(
                token.value(),
                token.expiresAt(),
                toUsuarioResponse(colaborador)
        );
    }

    public AuthDtos.UsuarioLogadoResponse me() {
        AuthenticatedUser current = CurrentUser.get()
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Faca login para continuar."));

        return jdbcTemplate.query("""
                SELECT c.id_colaborador AS id, c.nome, c.cpf, ca.nome_cargo AS cargo,
                       c.email, c.telefone, c.status
                FROM colaborador c
                JOIN cargo ca ON ca.id_cargo = c.id_cargo
                WHERE c.id_colaborador = ?
                """, (rs, rowNum) -> new AuthDtos.UsuarioLogadoResponse(
                rs.getLong("id"),
                rs.getString("nome"),
                rs.getString("cpf"),
                Cargo.fromJson(rs.getString("cargo")),
                rs.getString("email"),
                rs.getString("telefone"),
                "Ativo".equalsIgnoreCase(rs.getString("status"))
        ), current.id()).stream().findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Usuario nao encontrado."));
    }

    private Optional<ColaboradorAuth> findByCpf(String cpf) {
        String digits = cpf == null ? "" : cpf.replaceAll("\\D", "");
        String sql = """
                SELECT c.id_colaborador AS id, c.nome, c.cpf, c.senha AS senha_hash,
                       ca.nome_cargo AS cargo, c.email, c.telefone, c.status
                FROM colaborador c
                JOIN cargo ca ON ca.id_cargo = c.id_cargo
                WHERE c.cpf = ?
                   OR REPLACE(REPLACE(REPLACE(c.cpf, '.', ''), '-', ''), ' ', '') = ?
                LIMIT 1
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> new ColaboradorAuth(
                rs.getLong("id"),
                rs.getString("nome"),
                rs.getString("cpf"),
                rs.getString("senha_hash"),
                Cargo.fromJson(rs.getString("cargo")),
                rs.getString("email"),
                rs.getString("telefone"),
                "Ativo".equalsIgnoreCase(rs.getString("status"))
        ), cpf, digits).stream().findFirst();
    }

    private AuthDtos.UsuarioLogadoResponse toUsuarioResponse(ColaboradorAuth colaborador) {
        return new AuthDtos.UsuarioLogadoResponse(
                colaborador.id(),
                colaborador.nome(),
                colaborador.cpf(),
                colaborador.cargo(),
                colaborador.email(),
                colaborador.telefone(),
                colaborador.ativo()
        );
    }

    private record ColaboradorAuth(
            Long id,
            String nome,
            String cpf,
            String senhaHash,
            Cargo cargo,
            String email,
            String telefone,
            Boolean ativo
    ) {
    }
}
