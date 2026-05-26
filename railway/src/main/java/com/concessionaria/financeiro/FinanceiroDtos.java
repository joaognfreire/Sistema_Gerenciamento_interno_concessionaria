package com.concessionaria.financeiro;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public final class FinanceiroDtos {
    private FinanceiroDtos() {
    }

    public record RegistroFinanceiroResponse(
            Long id,
            TipoFinanceiro tipo,
            String categoria,
            String descricao,
            BigDecimal valor,
            LocalDate dataMovimento,
            Long responsavelId,
            String responsavelNome,
            Long carroId,
            String carroResumo,
            Boolean apagado,
            Long apagadoPorId,
            String apagadoPorNome,
            LocalDateTime apagadoEm,
            LocalDateTime criadoEm,
            LocalDateTime atualizadoEm
    ) {
    }

    public record CreateRegistroFinanceiroRequest(
            @NotNull(message = "Tipo e obrigatorio")
            TipoFinanceiro tipo,

            @NotBlank(message = "Categoria e obrigatoria")
            String categoria,

            @NotBlank(message = "Descricao e obrigatoria")
            String descricao,

            @NotNull(message = "Valor e obrigatorio")
            @DecimalMin(value = "0.01", inclusive = true, message = "Valor deve ser maior que zero")
            BigDecimal valor,

            @NotNull(message = "Data e obrigatoria")
            LocalDate dataMovimento,

            Long carroId
    ) {
    }

    public record UpdateRegistroFinanceiroRequest(
            @NotNull(message = "Tipo e obrigatorio")
            TipoFinanceiro tipo,

            @NotBlank(message = "Categoria e obrigatoria")
            String categoria,

            @NotBlank(message = "Descricao e obrigatoria")
            String descricao,

            @NotNull(message = "Valor e obrigatorio")
            @DecimalMin(value = "0.01", inclusive = true, message = "Valor deve ser maior que zero")
            BigDecimal valor,

            @NotNull(message = "Data e obrigatoria")
            LocalDate dataMovimento,

            Long carroId
    ) {
    }

    public record ResumoFinanceiroResponse(
            BigDecimal totalEntradas,
            BigDecimal totalSaidas,
            BigDecimal saldoTotal
    ) {
    }
}
