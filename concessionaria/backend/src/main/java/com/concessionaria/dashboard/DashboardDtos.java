package com.concessionaria.dashboard;

import java.math.BigDecimal;

public final class DashboardDtos {
    private DashboardDtos() {
    }

    public record DashboardResponse(
            Long meusRelatorios,
            Long meusRelatoriosPendentes,
            Long carrosCadastrados,
            Long colaboradoresAtivos,
            Long carrosDisponiveis,
            BigDecimal totalEntradas,
            BigDecimal totalSaidas,
            BigDecimal saldoTotal
    ) {
    }
}
