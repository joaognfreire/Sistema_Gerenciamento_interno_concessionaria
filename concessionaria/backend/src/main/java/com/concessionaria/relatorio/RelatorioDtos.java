package com.concessionaria.relatorio;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.Map;

public final class RelatorioDtos {
    private RelatorioDtos() {
    }

    public record RelatorioResponse(
            Long id,
            String titulo,
            String descricao,
            String categoria,
            PrioridadeRelatorio prioridade,
            StatusRelatorio status,
            Long autorId,
            String autorNome,
            Long carroId,
            String carroResumo,
            String resposta,
            Long respondidoPorId,
            String respondidoPorNome,
            LocalDateTime respondidoEm,
            Boolean apagado,
            Long apagadoPorId,
            String apagadoPorNome,
            LocalDateTime apagadoEm,
            LocalDateTime criadoEm,
            LocalDateTime atualizadoEm
    ) {
    }

    public record CreateRelatorioRequest(
            @NotBlank(message = "Titulo e obrigatorio")
            String titulo,

            @NotBlank(message = "Descricao e obrigatoria")
            String descricao,

            @NotBlank(message = "Categoria e obrigatoria")
            String categoria,

            @NotNull(message = "Prioridade e obrigatoria")
            PrioridadeRelatorio prioridade,

            Long carroId
    ) {
    }

    public record UpdateRelatorioRequest(
            @NotBlank(message = "Titulo e obrigatorio")
            String titulo,

            @NotBlank(message = "Descricao e obrigatoria")
            String descricao,

            @NotBlank(message = "Categoria e obrigatoria")
            String categoria,

            @NotNull(message = "Prioridade e obrigatoria")
            PrioridadeRelatorio prioridade,

            @NotNull(message = "Status e obrigatorio")
            StatusRelatorio status,

            Long carroId
    ) {
    }

    public record StatusRequest(
            @NotNull(message = "Status e obrigatorio")
            StatusRelatorio status
    ) {
    }

    public record RespostaRequest(
            @NotBlank(message = "Resposta e obrigatoria")
            String resposta
    ) {
    }

    public record ContadoresResponse(
            Map<StatusRelatorio, Long> porStatus,
            Long total
    ) {
    }
}
