package com.concessionaria.dashboard;

import com.concessionaria.financeiro.FinanceiroService;
import com.concessionaria.security.AuthenticatedUser;
import com.concessionaria.security.Cargo;
import com.concessionaria.security.PermissionService;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {
    private final JdbcTemplate jdbcTemplate;
    private final PermissionService permissionService;
    private final FinanceiroService financeiroService;

    public DashboardService(JdbcTemplate jdbcTemplate, PermissionService permissionService, FinanceiroService financeiroService) {
        this.jdbcTemplate = jdbcTemplate;
        this.permissionService = permissionService;
        this.financeiroService = financeiroService;
    }

    public DashboardDtos.DashboardResponse dashboard() {
        AuthenticatedUser user = permissionService.requireAuthenticated();

        Long meusRelatorios = count("SELECT COUNT(*) FROM relatorio WHERE id_colaborador = ?", user.id());
        Long meusPendentes = count("SELECT COUNT(*) FROM relatorio WHERE id_colaborador = ? AND status = 'Pendente'", user.id());
        Long carrosCadastrados = count("SELECT COUNT(*) FROM veiculo");

        Long colaboradoresAtivos = null;
        Long carrosDisponiveis = null;
        java.math.BigDecimal totalEntradas = null;
        java.math.BigDecimal totalSaidas = null;
        java.math.BigDecimal saldoTotal = null;

        if (user.cargo().atLeast(Cargo.GERENTE)) {
            colaboradoresAtivos = count("SELECT COUNT(*) FROM colaborador WHERE status = 'Ativo'");
            carrosDisponiveis = count("SELECT COUNT(*) FROM veiculo WHERE status = 'Disponivel'");
        }

        if (user.cargo().atLeast(Cargo.GERENTE_FINANCEIRO)) {
            var resumo = financeiroService.resumoInterno();
            totalEntradas = resumo.totalEntradas();
            totalSaidas = resumo.totalSaidas();
            saldoTotal = resumo.saldoTotal();
        }

        return new DashboardDtos.DashboardResponse(
                meusRelatorios,
                meusPendentes,
                carrosCadastrados,
                colaboradoresAtivos,
                carrosDisponiveis,
                totalEntradas,
                totalSaidas,
                saldoTotal
        );
    }

    private Long count(String sql, Object... params) {
        Long value = jdbcTemplate.queryForObject(sql, Long.class, params);
        return value == null ? 0L : value;
    }
}
