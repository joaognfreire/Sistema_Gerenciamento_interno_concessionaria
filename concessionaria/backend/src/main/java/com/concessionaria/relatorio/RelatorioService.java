package com.concessionaria.relatorio;

import com.concessionaria.common.ApiException;
import com.concessionaria.common.TextNormalizer;
import com.concessionaria.security.AuthenticatedUser;
import com.concessionaria.security.Cargo;
import com.concessionaria.security.PermissionService;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class RelatorioService {
    private final JdbcTemplate jdbcTemplate;
    private final PermissionService permissionService;

    public RelatorioService(JdbcTemplate jdbcTemplate, PermissionService permissionService) {
        this.jdbcTemplate = jdbcTemplate;
        this.permissionService = permissionService;
    }

    public List<RelatorioDtos.RelatorioResponse> list(StatusRelatorio status) {
        AuthenticatedUser user = permissionService.requireAuthenticated();
        boolean manager = user.cargo().atLeast(Cargo.GERENTE);

        StringBuilder sql = new StringBuilder(baseSelect() + " WHERE 1 = 1 ");
        java.util.ArrayList<Object> params = new java.util.ArrayList<>();

        if (!manager) {
            sql.append(" AND r.id_colaborador = ? ");
            params.add(user.id());
        }

        if (status != null) {
            sql.append(" AND r.status = ? ");
            params.add(status.dbValue());
        }

        sql.append(" ORDER BY r.criado_em DESC ");
        return jdbcTemplate.query(sql.toString(), (rs, rowNum) -> mapRow(rs), params.toArray());
    }

    public RelatorioDtos.RelatorioResponse findById(Long id) {
        AuthenticatedUser user = permissionService.requireAuthenticated();
        RelatorioDtos.RelatorioResponse response = jdbcTemplate.query(baseSelect() + " WHERE r.id = ?",
                        (rs, rowNum) -> mapRow(rs), id)
                .stream()
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Relatorio nao encontrado."));

        if (!user.cargo().atLeast(Cargo.GERENTE) && !Objects.equals(response.autorId(), user.id())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Voce so pode visualizar seus proprios relatorios.");
        }

        return response;
    }

    public RelatorioDtos.ContadoresResponse countByStatus() {
        AuthenticatedUser user = permissionService.requireAuthenticated();
        boolean manager = user.cargo().atLeast(Cargo.GERENTE);

        Map<StatusRelatorio, Long> counters = new EnumMap<>(StatusRelatorio.class);
        for (StatusRelatorio status : StatusRelatorio.values()) {
            counters.put(status, 0L);
        }

        String sql = "SELECT status, COUNT(*) total FROM relatorio " +
                (manager ? "" : "WHERE id_colaborador = ? ") +
                "GROUP BY status";

        Object[] params = manager ? new Object[]{} : new Object[]{user.id()};
        jdbcTemplate.query(sql, rs -> {
            counters.put(StatusRelatorio.fromJson(rs.getString("status")), rs.getLong("total"));
        }, params);

        long total = counters.values().stream().mapToLong(Long::longValue).sum();
        return new RelatorioDtos.ContadoresResponse(counters, total);
    }

    @Transactional
    public RelatorioDtos.RelatorioResponse create(RelatorioDtos.CreateRelatorioRequest request) {
        AuthenticatedUser user = permissionService.requireAuthenticated();
        if (request.carroId() != null) {
            ensureCarExists(request.carroId());
        }

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement("""
                    INSERT INTO relatorio
                    (id_veiculo, id_colaborador, titulo, descricao, categoria, prioridade, status)
                    VALUES (?, ?, ?, ?, ?, ?, 'Pendente')
                    """, Statement.RETURN_GENERATED_KEYS);
            ps.setObject(1, request.carroId());
            ps.setLong(2, user.id());
            ps.setString(3, request.titulo().trim());
            ps.setString(4, request.descricao().trim());
            ps.setString(5, request.categoria().trim());
            ps.setString(6, request.prioridade().dbValue());
            return ps;
        }, keyHolder);

        return findById(Objects.requireNonNull(keyHolder.getKey()).longValue());
    }

    @Transactional
    public RelatorioDtos.RelatorioResponse updateStatus(Long id, StatusRelatorio status) {
        permissionService.requireRole(Cargo.GERENTE);
        findById(id);

        if (status == StatusRelatorio.ARQUIVADO) {
            permissionService.requireOwner();
        }

        jdbcTemplate.update("UPDATE relatorio SET status = ? WHERE id_relatorio = ?", status.dbValue(), id);
        return findById(id);
    }

    @Transactional
    public RelatorioDtos.RelatorioResponse responder(Long id, String resposta) {
        AuthenticatedUser user = permissionService.requireOwner();
        findById(id);

        if (!TextNormalizer.hasText(resposta)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Resposta e obrigatoria.");
        }

        jdbcTemplate.update("""
                INSERT INTO resposta_relatorio (id_relatorio, id_colaborador, mensagem, data_resposta)
                VALUES (?, ?, ?, ?)
                """, id, user.id(), resposta.trim(), Timestamp.valueOf(LocalDateTime.now()));
        jdbcTemplate.update("UPDATE relatorio SET status = 'Resolvido' WHERE id_relatorio = ?", id);

        return findById(id);
    }

    @Transactional
    public RelatorioDtos.RelatorioResponse arquivar(Long id) {
        permissionService.requireOwner();
        findById(id);
        jdbcTemplate.update("UPDATE relatorio SET status = 'Arquivado' WHERE id_relatorio = ?", id);
        return findById(id);
    }

    private String baseSelect() {
        return """
                SELECT r.id_relatorio AS id, r.titulo, r.descricao, r.categoria, r.prioridade, r.status,
                       r.id_colaborador AS autor_id, autor.nome AS autor_nome,
                       r.id_veiculo AS carro_id,
                       CASE WHEN v.id_veiculo IS NULL THEN NULL ELSE CONCAT(v.marca, ' ', v.modelo, ' - ', v.placa) END AS carro_resumo,
                       resposta.mensagem AS resposta, resposta.id_colaborador AS respondido_por_id,
                       respondente.nome AS respondido_por_nome, resposta.data_resposta AS respondido_em,
                       r.criado_em, r.atualizado_em
                FROM relatorio r
                JOIN colaborador autor ON autor.id_colaborador = r.id_colaborador
                LEFT JOIN veiculo v ON v.id_veiculo = r.id_veiculo
                LEFT JOIN resposta_relatorio resposta ON resposta.id_resposta = (
                    SELECT rr.id_resposta
                    FROM resposta_relatorio rr
                    WHERE rr.id_relatorio = r.id_relatorio
                    ORDER BY rr.data_resposta DESC, rr.id_resposta DESC
                    LIMIT 1
                )
                LEFT JOIN colaborador respondente ON respondente.id_colaborador = resposta.id_colaborador
                """;
    }

    private RelatorioDtos.RelatorioResponse mapRow(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new RelatorioDtos.RelatorioResponse(
                rs.getLong("id"),
                rs.getString("titulo"),
                rs.getString("descricao"),
                rs.getString("categoria"),
                PrioridadeRelatorio.fromJson(rs.getString("prioridade")),
                StatusRelatorio.fromJson(rs.getString("status")),
                rs.getObject("autor_id") == null ? null : rs.getLong("autor_id"),
                rs.getString("autor_nome"),
                rs.getObject("carro_id") == null ? null : rs.getLong("carro_id"),
                rs.getString("carro_resumo"),
                rs.getString("resposta"),
                rs.getObject("respondido_por_id") == null ? null : rs.getLong("respondido_por_id"),
                rs.getString("respondido_por_nome"),
                rs.getTimestamp("respondido_em") == null ? null : rs.getTimestamp("respondido_em").toLocalDateTime(),
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
