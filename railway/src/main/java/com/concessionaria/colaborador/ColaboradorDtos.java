package com.concessionaria.colaborador;

import com.concessionaria.security.Cargo;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public final class ColaboradorDtos {
    private ColaboradorDtos() {
    }

    public record ColaboradorResponse(
            Long id,
            String nome,
            String cpf,
            Cargo cargo,
            String email,
            String telefone,
            LocalDate dataNascimento,
            LocalDate dataAdmissao,
            BigDecimal salario,
            Boolean ativo,
            LocalDateTime criadoEm,
            LocalDateTime atualizadoEm
    ) {
    }

    public record CreateColaboradorRequest(
            @NotBlank(message = "Nome e obrigatorio")
            String nome,

            @NotBlank(message = "CPF e obrigatorio")
            String cpf,

            @NotBlank(message = "Senha e obrigatoria")
            String senha,

            @NotNull(message = "Cargo e obrigatorio")
            Cargo cargo,

            @Email(message = "Email invalido")
            String email,

            String telefone,
            LocalDate dataNascimento,

            @NotNull(message = "Data de admissao e obrigatoria")
            LocalDate dataAdmissao,

            @NotNull(message = "Salario e obrigatorio")
            @DecimalMin(value = "0.0", inclusive = true, message = "Salario deve ser positivo")
            BigDecimal salario
    ) {
    }

    public record UpdateColaboradorRequest(
            @NotBlank(message = "Nome e obrigatorio")
            String nome,

            @NotBlank(message = "CPF e obrigatorio")
            String cpf,

            String senha,

            @NotNull(message = "Cargo e obrigatorio")
            Cargo cargo,

            @Email(message = "Email invalido")
            String email,

            String telefone,
            LocalDate dataNascimento,

            @NotNull(message = "Data de admissao e obrigatoria")
            LocalDate dataAdmissao,

            @NotNull(message = "Salario e obrigatorio")
            @DecimalMin(value = "0.0", inclusive = true, message = "Salario deve ser positivo")
            BigDecimal salario,

            @NotNull(message = "Status ativo/inativo e obrigatorio")
            Boolean ativo
    ) {
    }
}
