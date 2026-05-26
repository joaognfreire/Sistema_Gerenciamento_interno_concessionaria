package com.concessionaria.financeiro;

import com.concessionaria.common.ApiException;
import com.concessionaria.common.BrazilTime;
import com.concessionaria.security.AuthenticatedUser;
import com.concessionaria.security.Cargo;
import com.concessionaria.security.PermissionService;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class FinanceiroService {
    private final JdbcTemplate jdbcTemplate;
    private final PermissionService permissionService;

    public FinanceiroService(JdbcTemplate jdbcTemplate, PermissionService permissionService) {
        this.jdbcTemplate = jdbcTemplate;
        this.permissionService = permissionService;
    }

    public FinanceiroDtos.ResumoFinanceiroResponse resumo() {
        permissionService.requireRole(Cargo.GERENTE_FINANCEIRO);
        return resumoInterno();
    }

    public List<FinanceiroDtos.RegistroFinanceiroResponse> list(TipoFinanceiro tipo, Boolean apagado) {
        permissionService.requireRole(Cargo.GERENTE_FINANCEIRO);

        StringBuilder sql = new StringBuilder(baseSelect() + " WHERE f.apagado = ? ");
        List<Object> params = new ArrayList<>();
        params.add(Boolean.TRUE.equals(apagado));

        if (tipo != null) {
            sql.append(" AND f.tipo = ? ");
            params.add(tipo.dbValue());
        }

        sql.append(" ORDER BY f.data_movimento DESC, f.criado_em DESC ");
        return jdbcTemplate.query(sql.toString(), (rs, rowNum) -> mapRow(rs), params.toArray());
    }

    @Transactional
    public FinanceiroDtos.RegistroFinanceiroResponse create(FinanceiroDtos.CreateRegistroFinanceiroRequest request) {
        AuthenticatedUser user = permissionService.requireRole(Cargo.GERENTE_FINANCEIRO);
        if (request.carroId() != null) {
            ensureCarExists(request.carroId());
        }

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement("""
                    INSERT INTO financeiro
                    (id_colaborador, id_veiculo, tipo, categoria, descricao, valor, data_movimento)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, user.id());
            ps.setObject(2, request.carroId());
            ps.setString(3, request.tipo().dbValue());
            ps.setString(4, request.categoria().trim());
            ps.setString(5, request.descricao().trim());
            ps.setBigDecimal(6, request.valor());
            ps.setDate(7, Date.valueOf(request.dataMovimento()));
            return ps;
        }, keyHolder);

        Long id = Objects.requireNonNull(keyHolder.getKey()).longValue();
        return findById(id);
    }

    @Transactional
    public FinanceiroDtos.RegistroFinanceiroResponse update(Long id, FinanceiroDtos.UpdateRegistroFinanceiroRequest request) {
        permissionService.requireRole(Cargo.GERENTE_FINANCEIRO);
        findById(id);
        if (request.carroId() != null) {
            ensureCarExists(request.carroId());
        }

        jdbcTemplate.update("""
                UPDATE financeiro
                SET id_veiculo = ?, tipo = ?, categoria = ?, descricao = ?, valor = ?, data_movimento = ?
                WHERE id_financeiro = ?
                """,
                request.carroId(),
                request.tipo().dbValue(),
                request.categoria().trim(),
                request.descricao().trim(),
                request.valor(),
                Date.valueOf(request.dataMovimento()),
                id
        );

        return findById(id);
    }

    @Transactional
    public void delete(Long id) {
        AuthenticatedUser user = permissionService.requireRole(Cargo.GERENTE_FINANCEIRO);
        findById(id);

        jdbcTemplate.update("""
                UPDATE financeiro
                SET apagado = TRUE, apagado_em = ?, apagado_por_id = ?
                WHERE id_financeiro = ?
                """, Timestamp.valueOf(BrazilTime.now()), user.id(), id);
    }

    @Transactional
    public FinanceiroDtos.RegistroFinanceiroResponse restore(Long id) {
        permissionService.requireRole(Cargo.GERENTE_FINANCEIRO);
        findById(id);

        jdbcTemplate.update("""
                UPDATE financeiro
                SET apagado = FALSE, apagado_em = NULL, apagado_por_id = NULL
                WHERE id_financeiro = ?
                """, id);

        return findById(id);
    }

    public FinanceiroDtos.ResumoFinanceiroResponse resumoInterno() {
        BigDecimal entradas = jdbcTemplate.queryForObject("""
                SELECT COALESCE(SUM(valor), 0)
                FROM financeiro
                WHERE tipo = 'Entrada' AND apagado = FALSE
                """, BigDecimal.class);
        BigDecimal saidas = jdbcTemplate.queryForObject("""
                SELECT COALESCE(SUM(valor), 0)
                FROM financeiro
                WHERE tipo = 'Saida' AND apagado = FALSE
                """, BigDecimal.class);

        entradas = entradas == null ? BigDecimal.ZERO : entradas;
        saidas = saidas == null ? BigDecimal.ZERO : saidas;
        return new FinanceiroDtos.ResumoFinanceiroResponse(entradas, saidas, entradas.subtract(saidas));
    }

    private FinanceiroDtos.RegistroFinanceiroResponse findById(Long id) {
        return jdbcTemplate.query(baseSelect() + " WHERE f.id_financeiro = ?", (rs, rowNum) -> mapRow(rs), id)
                .stream()
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Registro financeiro nao encontrado."));
    }

    private String baseSelect() {
        return """
                SELECT f.id_financeiro AS id, f.tipo, f.categoria, f.descricao, f.valor, f.data_movimento,
                       f.id_colaborador AS responsavel_id, responsavel.nome AS responsavel_nome,
                       f.id_veiculo AS carro_id,
                       CASE WHEN v.id_veiculo IS NULL THEN NULL ELSE CONCAT(v.marca, ' ', v.modelo, ' - ', v.placa) END AS carro_resumo,
                       f.apagado, f.apagado_por_id, apagador.nome AS apagado_por_nome, f.apagado_em,
                       f.criado_em, f.atualizado_em
                FROM financeiro f
                JOIN colaborador responsavel ON responsavel.id_colaborador = f.id_colaborador
                LEFT JOIN colaborador apagador ON apagador.id_colaborador = f.apagado_por_id
                LEFT JOIN veiculo v ON v.id_veiculo = f.id_veiculo
                """;
    }

    private FinanceiroDtos.RegistroFinanceiroResponse mapRow(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new FinanceiroDtos.RegistroFinanceiroResponse(
                rs.getLong("id"),
                TipoFinanceiro.fromJson(rs.getString("tipo")),
                rs.getString("categoria"),
                rs.getString("descricao"),
                rs.getBigDecimal("valor"),
                rs.getDate("data_movimento") == null ? null : rs.getDate("data_movimento").toLocalDate(),
                rs.getObject("responsavel_id") == null ? null : rs.getLong("responsavel_id"),
                rs.getString("responsavel_nome"),
                rs.getObject("carro_id") == null ? null : rs.getLong("carro_id"),
                rs.getString("carro_resumo"),
                rs.getBoolean("apagado"),
                rs.getObject("apagado_por_id") == null ? null : rs.getLong("apagado_por_id"),
                rs.getString("apagado_por_nome"),
                rs.getTimestamp("apagado_em") == null ? null : rs.getTimestamp("apagado_em").toLocalDateTime(),
                rs.getTimestamp("criado_em") == null ? null : rs.getTimestamp("criado_em").toLocalDateTime(),
                rs.getTimestamp("atualizado_em") == null ? null : rs.getTimestamp("atualizado_em").toLocalDateTime()
        );
    }

    private void ensureCarExists(Long carroId) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM veiculo WHERE id_veiculo = ?", Integer.class, carroId);
        if (count == null || count == 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Carro vinculado nao encontrado.");
        }
    }
}
