package com.concessionaria.auth;

import com.concessionaria.security.Cargo;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;

public final class AuthDtos {
    private AuthDtos() {
    }

    public record LoginRequest(
            @NotBlank(message = "CPF e obrigatorio")
            String cpf,

            @NotBlank(message = "Senha e obrigatoria")
            String senha
    ) {
    }

    public record UsuarioLogadoResponse(
            Long id,
            String nome,
            String cpf,
            Cargo cargo,
            String email,
            String telefone,
            Boolean ativo
    ) {
    }

    public record LoginResponse(
            String token,
            Instant expiresAt,
            UsuarioLogadoResponse usuario
    ) {
    }
}
