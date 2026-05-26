package com.concessionaria.colaborador;

import com.concessionaria.common.ApiException;
import com.concessionaria.common.TextNormalizer;
import com.concessionaria.security.AuthenticatedUser;
import com.concessionaria.security.Cargo;
import com.concessionaria.security.PasswordService;
import com.concessionaria.security.PermissionService;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class ColaboradorService {
    private final JdbcTemplate jdbcTemplate;
    private final PasswordService passwordService;
    private final PermissionService permissionService;

    public ColaboradorService(JdbcTemplate jdbcTemplate, PasswordService passwordService, PermissionService permissionService) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordService = passwordService;
        this.permissionService = permissionService;
    }

    private final RowMapper<ColaboradorDtos.ColaboradorResponse> rowMapper = (rs, rowNum) ->
            new ColaboradorDtos.ColaboradorResponse(
                    rs.getLong("id"),
                    rs.getString("nome"),
                    rs.getString("cpf"),
                    Cargo.fromJson(rs.getString("cargo")),
                    rs.getString("email"),
                    rs.getString("telefone"),
                    rs.getDate("data_nascimento") == null ? null : rs.getDate("data_nascimento").toLocalDate(),
                    rs.getDate("data_admissao") == null ? null : rs.getDate("data_admissao").toLocalDate(),
                    rs.getBigDecimal("salario"),
                    "Ativo".equalsIgnoreCase(rs.getString("status")),
                    rs.getTimestamp("criado_em") == null ? null : rs.getTimestamp("criado_em").toLocalDateTime(),
                    rs.getTimestamp("atualizado_em") == null ? null : rs.getTimestamp("atualizado_em").toLocalDateTime()
            );

    public List<ColaboradorDtos.ColaboradorResponse> list(String busca, Boolean ativo) {
        permissionService.requireRole(Cargo.GERENTE);

        StringBuilder sql = new StringBuilder("""
                SELECT c.id_colaborador AS id, c.nome, c.cpf, ca.nome_cargo AS cargo, c.email, c.telefone,
                       c.data_nascimento, c.data_admissao, c.salario, c.status, c.criado_em, c.atualizado_em
                FROM colaborador c
                JOIN cargo ca ON ca.id_cargo = c.id_cargo
                WHERE 1 = 1
                """);
        List<Object> params = new ArrayList<>();

        if (TextNormalizer.hasText(busca)) {
            sql.append(" AND LOWER(c.nome) LIKE ? ");
            params.add("%" + busca.trim().toLowerCase() + "%");
        }

        if (ativo != null) {
            sql.append(" AND c.status = ? ");
            params.add(ativo ? "Ativo" : "Inativo");
        }

        sql.append(" ORDER BY c.status ASC, c.nome ASC ");
        return jdbcTemplate.query(sql.toString(), rowMapper, params.toArray());
    }

    public ColaboradorDtos.ColaboradorResponse findById(Long id) {
        permissionService.requireRole(Cargo.GERENTE);
        return findResponseById(id);
    }

    @Transactional
    public ColaboradorDtos.ColaboradorResponse create(ColaboradorDtos.CreateColaboradorRequest request) {
        permissionService.requireRole(Cargo.GERENTE);

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement("""
                    INSERT INTO colaborador
                    (id_cargo, nome, cpf, email, telefone, senha, data_nascimento, data_admissao, salario, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Ativo')
                    """, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, findCargoId(request.cargo()));
            ps.setString(2, request.nome().trim());
            ps.setString(3, request.cpf().trim());
            ps.setString(4, emptyToNull(request.email()));
            ps.setString(5, emptyToNull(request.telefone()));
            ps.setString(6, passwordService.encode(request.senha()));
            ps.setDate(7, request.dataNascimento() == null ? null : Date.valueOf(request.dataNascimento()));
            ps.setDate(8, Date.valueOf(request.dataAdmissao()));
            ps.setBigDecimal(9, request.salario());
            return ps;
        }, keyHolder);

        return findResponseById(Objects.requireNonNull(keyHolder.getKey()).longValue());
    }

    @Transactional
    public ColaboradorDtos.ColaboradorResponse update(Long id, ColaboradorDtos.UpdateColaboradorRequest request) {
        permissionService.requireRole(Cargo.GERENTE);
        ensureExists(id);

        if (!TextNormalizer.hasText(request.senha())) {
            jdbcTemplate.update("""
                    UPDATE colaborador
                    SET nome = ?, cpf = ?, id_cargo = ?, email = ?, telefone = ?, data_nascimento = ?,
                        data_admissao = ?, salario = ?, status = ?
                    WHERE id_colaborador = ?
                    """,
                    request.nome().trim(),
                    request.cpf().trim(),
                    findCargoId(request.cargo()),
                    emptyToNull(request.email()),
                    emptyToNull(request.telefone()),
                    request.dataNascimento() == null ? null : Date.valueOf(request.dataNascimento()),
                    Date.valueOf(request.dataAdmissao()),
                    request.salario(),
                    request.ativo() ? "Ativo" : "Inativo",
                    id
            );
        } else {
            jdbcTemplate.update("""
                    UPDATE colaborador
                    SET nome = ?, cpf = ?, senha = ?, id_cargo = ?, email = ?, telefone = ?, data_nascimento = ?,
                        data_admissao = ?, salario = ?, status = ?
                    WHERE id_colaborador = ?
                    """,
                    request.nome().trim(),
                    request.cpf().trim(),
                    passwordService.encode(request.senha()),
                    findCargoId(request.cargo()),
                    emptyToNull(request.email()),
                    emptyToNull(request.telefone()),
                    request.dataNascimento() == null ? null : Date.valueOf(request.dataNascimento()),
                    Date.valueOf(request.dataAdmissao()),
                    request.salario(),
                    request.ativo() ? "Ativo" : "Inativo",
                    id
            );
        }

        return findResponseById(id);
    }

    @Transactional
    public void delete(Long id) {
        AuthenticatedUser user = permissionService.requireRole(Cargo.GERENTE);
        ensureExists(id);

        if (user.id().equals(id)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Voce nao pode excluir seu proprio usuario logado.");
        }

        jdbcTemplate.update("UPDATE colaborador SET status = 'Inativo' WHERE id_colaborador = ?", id);
    }

    private ColaboradorDtos.ColaboradorResponse findResponseById(Long id) {
        return jdbcTemplate.query("""
                SELECT c.id_colaborador AS id, c.nome, c.cpf, ca.nome_cargo AS cargo, c.email, c.telefone,
                       c.data_nascimento, c.data_admissao, c.salario, c.status, c.criado_em, c.atualizado_em
                FROM colaborador c
                JOIN cargo ca ON ca.id_cargo = c.id_cargo
                WHERE c.id_colaborador = ?
                """, rowMapper, id).stream().findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Colaborador nao encontrado."));
    }

    private void ensureExists(Long id) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM colaborador WHERE id_colaborador = ?", Integer.class, id);
        if (count == null || count == 0) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Colaborador nao encontrado.");
        }
    }

    private Long findCargoId(Cargo cargo) {
        return jdbcTemplate.query("""
                SELECT id_cargo
                FROM cargo
                WHERE nome_cargo = ?
                """, (rs, rowNum) -> rs.getLong("id_cargo"), cargo.dbValue())
                .stream()
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Cargo nao cadastrado no banco: " + cargo.dbValue()));
    }

    private String emptyToNull(String value) {
        return TextNormalizer.hasText(value) ? value.trim() : null;
    }
}
