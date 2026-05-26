package com.concessionaria.security;

public record AuthenticatedUser(
        Long id,
        String nome,
        String cpf,
        Cargo cargo,
        String email
) {
}
