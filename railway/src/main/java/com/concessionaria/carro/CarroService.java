package com.concessionaria.carro;

import com.concessionaria.common.ApiException;
import com.concessionaria.common.TextNormalizer;
import com.concessionaria.security.AuthenticatedUser;
import com.concessionaria.security.Cargo;
import com.concessionaria.security.PermissionService;
import com.concessionaria.storage.FileStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class CarroService {
    private final JdbcTemplate jdbcTemplate;
    private final PermissionService permissionService;
    private final FileStorageService fileStorageService;

    public CarroService(JdbcTemplate jdbcTemplate, PermissionService permissionService, FileStorageService fileStorageService) {
        this.jdbcTemplate = jdbcTemplate;
        this.permissionService = permissionService;
        this.fileStorageService = fileStorageService;
    }

    public List<CarroDtos.CarroResponse> list(String busca, StatusCarro status) {
        AuthenticatedUser user = permissionService.requireAuthenticated();

        StringBuilder sql = new StringBuilder("""
                SELECT v.id_veiculo AS id, v.marca, v.modelo, CAST(v.ano_modelo AS UNSIGNED) AS ano,
                       v.placa, v.cor, v.categoria, v.chassi, v.renavam, v.quilometragem,
                       v.status, v.valor_compra, v.valor_venda, v.data_compra, v.data_venda,
                       v.observacoes, v.criado_em, v.atualizado_em
                FROM veiculo v
                WHERE 1 = 1
                """);
        List<Object> params = new ArrayList<>();

        if (TextNormalizer.hasText(busca)) {
            sql.append(" AND (LOWER(v.marca) LIKE ? OR LOWER(v.modelo) LIKE ? OR LOWER(v.placa) LIKE ?) ");
            String term = "%" + busca.trim().toLowerCase() + "%";
            params.add(term);
            params.add(term);
            params.add(term);
        }

        if (status != null) {
            sql.append(" AND status = ? ");
            params.add(status.dbValue());
        }

        sql.append(" ORDER BY FIELD(v.status, 'Disponivel', 'Manutencao', 'Vendido'), v.marca, v.modelo ");
        return jdbcTemplate.query(sql.toString(), (rs, rowNum) -> toResponse(mapRow(rs), user), params.toArray());
    }

    public CarroDtos.CarroResponse findById(Long id) {
        AuthenticatedUser user = permissionService.requireAuthenticated();
        return toResponse(findRowById(id), user);
    }

    @Transactional
    public CarroDtos.CarroResponse create(CarroDtos.CarroRequest request, List<MultipartFile> fotos) {
        AuthenticatedUser user = permissionService.requireRole(Cargo.GERENTE);
        if (fotos == null || fotos.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Adicione pelo menos uma imagem antes de cadastrar o veiculo.");
        }
        ensureUniqueFields(request, null);

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement("""
                    INSERT INTO veiculo
                    (id_colaborador, marca, modelo, ano_fabricacao, ano_modelo, placa, cor, categoria,
                     chassi, renavam, quilometragem, valor_compra, valor_venda, data_compra, data_venda,
                     status, observacoes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, Statement.RETURN_GENERATED_KEYS);
            fillCarStatement(ps, request, user.id());
            return ps;
        }, keyHolder);

        Long carroId = Objects.requireNonNull(keyHolder.getKey()).longValue();
        savePhotos(carroId, fotos);
        return toResponse(findRowById(carroId), user);
    }

    @Transactional
    public CarroDtos.CarroResponse update(Long id, CarroDtos.CarroRequest request, List<MultipartFile> novasFotos) {
        AuthenticatedUser user = permissionService.requireRole(Cargo.GERENTE);
        ensureExists(id);
        ensureUniqueFields(request, id);

        jdbcTemplate.update("""
                UPDATE veiculo
                SET marca = ?, modelo = ?, ano_fabricacao = ?, ano_modelo = ?, placa = ?, cor = ?,
                    categoria = ?, chassi = ?, renavam = ?, quilometragem = ?, valor_compra = ?,
                    valor_venda = ?, data_compra = ?, data_venda = ?, status = ?, observacoes = ?
                WHERE id_veiculo = ?
                """,
                request.marca().trim(),
                request.modelo().trim(),
                request.ano(),
                request.ano(),
                request.placa().trim(),
                request.cor().trim(),
                request.categoria().trim(),
                request.chassi().trim(),
                request.renavam().trim(),
                request.quilometragem(),
                request.valorCompra(),
                request.valorVenda(),
                Date.valueOf(request.dataCompra()),
                request.dataVenda() == null ? null : Date.valueOf(request.dataVenda()),
                request.status().dbValue(),
                emptyToNull(request.observacoes()),
                id
        );

        if (request.removerFotoIds() != null) {
            for (Long fotoId : request.removerFotoIds()) {
                removePhotoInternal(id, fotoId);
            }
        }

        savePhotos(id, novasFotos);
        ensurePrincipalPhoto(id);
        return toResponse(findRowById(id), user);
    }

    @Transactional
    public List<CarroDtos.FotoResponse> addPhotos(Long id, List<MultipartFile> fotos) {
        permissionService.requireRole(Cargo.GERENTE);
        ensureExists(id);
        savePhotos(id, fotos);
        return findPhotos(id);
    }

    @Transactional
    public void removePhoto(Long carroId, Long fotoId) {
        permissionService.requireRole(Cargo.GERENTE);
        removePhotoInternal(carroId, fotoId);
        ensurePrincipalPhoto(carroId);
    }

    @Transactional
    public void delete(Long id) {
        permissionService.requireRole(Cargo.GERENTE);
        ensureExists(id);

        List<CarroDtos.FotoResponse> fotos = findPhotos(id);
        jdbcTemplate.update("UPDATE financeiro SET id_veiculo = NULL WHERE id_veiculo = ?", id);
        jdbcTemplate.update("UPDATE relatorio SET id_veiculo = NULL WHERE id_veiculo = ?", id);
        jdbcTemplate.update("DELETE FROM venda WHERE id_veiculo = ?", id);
        jdbcTemplate.update("DELETE FROM veiculo WHERE id_veiculo = ?", id);

        for (CarroDtos.FotoResponse foto : fotos) {
            fileStorageService.deleteByUrl(foto.url());
        }
    }

    private void savePhotos(Long carroId, List<MultipartFile> fotos) {
        if (fotos == null || fotos.isEmpty()) {
            return;
        }

        Integer existingCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM imagem_veiculo WHERE id_veiculo = ?", Integer.class, carroId);
        Integer maxOrder = jdbcTemplate.queryForObject("SELECT COALESCE(MAX(ordem), 0) FROM imagem_veiculo WHERE id_veiculo = ?", Integer.class, carroId);
        int count = existingCount == null ? 0 : existingCount;
        int order = maxOrder == null ? 0 : maxOrder;

        for (MultipartFile foto : fotos) {
            FileStorageService.StoredFile stored = fileStorageService.storeCarPhoto(carroId, foto);
            boolean principal = count == 0;
            jdbcTemplate.update("""
                    INSERT INTO imagem_veiculo (id_veiculo, url_imagem, imagem_principal, ordem)
                    VALUES (?, ?, ?, ?)
                    """, carroId, stored.url(), principal, ++order);
            count++;
        }
    }

    private void removePhotoInternal(Long carroId, Long fotoId) {
        var photos = jdbcTemplate.query("""
                SELECT id_imagem AS id, url_imagem AS url, imagem_principal AS principal, ordem
                FROM imagem_veiculo
                WHERE id_veiculo = ? AND id_imagem = ?
                """, (rs, rowNum) -> new CarroDtos.FotoResponse(
                rs.getLong("id"),
                rs.getString("url"),
                null,
                null,
                rs.getBoolean("principal"),
                rs.getInt("ordem")
        ), carroId, fotoId);

        if (photos.isEmpty()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Foto nao encontrada para este carro.");
        }

        fileStorageService.deleteByUrl(photos.get(0).url());
        jdbcTemplate.update("DELETE FROM imagem_veiculo WHERE id_imagem = ?", fotoId);
    }

    private void ensurePrincipalPhoto(Long carroId) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM imagem_veiculo WHERE id_veiculo = ?", Integer.class, carroId);
        if (count == null || count == 0) {
            return;
        }

        Integer principalCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM imagem_veiculo WHERE id_veiculo = ? AND imagem_principal = TRUE", Integer.class, carroId);
        if (principalCount != null && principalCount > 0) {
            return;
        }

        jdbcTemplate.update("""
                UPDATE imagem_veiculo
                SET imagem_principal = TRUE
                WHERE id_imagem = (
                    SELECT id FROM (
                        SELECT id_imagem AS id FROM imagem_veiculo WHERE id_veiculo = ? ORDER BY ordem ASC, id_imagem ASC LIMIT 1
                    ) primeira
                )
                """, carroId);
    }

    private CarroDtos.CarroResponse toResponse(CarroRow row, AuthenticatedUser user) {
        boolean canSeeValues = user.cargo().atLeast(Cargo.GERENTE);
        List<CarroDtos.FotoResponse> fotos = findPhotos(row.id());
        CarroDtos.FotoResponse principal = fotos.stream()
                .filter(foto -> Boolean.TRUE.equals(foto.principal()))
                .findFirst()
                .orElse(fotos.isEmpty() ? null : fotos.get(0));

        return new CarroDtos.CarroResponse(
                row.id(),
                row.marca(),
                row.modelo(),
                row.ano(),
                row.placa(),
                row.cor(),
                row.categoria(),
                row.chassi(),
                row.renavam(),
                row.quilometragem(),
                row.status(),
                canSeeValues ? row.valorCompra() : null,
                canSeeValues ? row.valorVenda() : null,
                row.dataCompra(),
                row.dataVenda(),
                row.observacoes(),
                fotos,
                principal,
                row.criadoEm(),
                row.atualizadoEm()
        );
    }

    private List<CarroDtos.FotoResponse> findPhotos(Long carroId) {
        return jdbcTemplate.query("""
                SELECT id_imagem AS id, url_imagem AS url, imagem_principal AS principal, ordem
                FROM imagem_veiculo
                WHERE id_veiculo = ?
                ORDER BY imagem_principal DESC, ordem ASC, id_imagem ASC
                """, (rs, rowNum) -> new CarroDtos.FotoResponse(
                rs.getLong("id"),
                rs.getString("url"),
                null,
                null,
                rs.getBoolean("principal"),
                rs.getInt("ordem")
        ), carroId);
    }

    private CarroRow findRowById(Long id) {
        return jdbcTemplate.query("""
                SELECT id_veiculo AS id, marca, modelo, CAST(ano_modelo AS UNSIGNED) AS ano,
                       placa, cor, categoria, chassi, renavam, quilometragem, status,
                       valor_compra, valor_venda, data_compra, data_venda, observacoes,
                       criado_em, atualizado_em
                FROM veiculo
                WHERE id_veiculo = ?
                """, (rs, rowNum) -> mapRow(rs), id).stream().findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Carro nao encontrado."));
    }

    private CarroRow mapRow(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new CarroRow(
                rs.getLong("id"),
                rs.getString("marca"),
                rs.getString("modelo"),
                rs.getInt("ano"),
                rs.getString("placa"),
                rs.getString("cor"),
                rs.getString("categoria"),
                rs.getString("chassi"),
                rs.getString("renavam"),
                rs.getLong("quilometragem"),
                StatusCarro.fromJson(rs.getString("status")),
                rs.getBigDecimal("valor_compra"),
                rs.getBigDecimal("valor_venda"),
                rs.getDate("data_compra") == null ? null : rs.getDate("data_compra").toLocalDate(),
                rs.getDate("data_venda") == null ? null : rs.getDate("data_venda").toLocalDate(),
                rs.getString("observacoes"),
                rs.getTimestamp("criado_em") == null ? null : rs.getTimestamp("criado_em").toLocalDateTime(),
                rs.getTimestamp("atualizado_em") == null ? null : rs.getTimestamp("atualizado_em").toLocalDateTime()
        );
    }

    private void fillCarStatement(PreparedStatement ps, CarroDtos.CarroRequest request, Long criadoPorId) throws java.sql.SQLException {
        ps.setObject(1, criadoPorId);
        ps.setString(2, request.marca().trim());
        ps.setString(3, request.modelo().trim());
        ps.setInt(4, request.ano());
        ps.setInt(5, request.ano());
        ps.setString(6, request.placa().trim());
        ps.setString(7, request.cor().trim());
        ps.setString(8, request.categoria().trim());
        ps.setString(9, request.chassi().trim());
        ps.setString(10, request.renavam().trim());
        ps.setLong(11, request.quilometragem());
        ps.setBigDecimal(12, request.valorCompra());
        ps.setBigDecimal(13, request.valorVenda());
        ps.setDate(14, Date.valueOf(request.dataCompra()));
        ps.setDate(15, request.dataVenda() == null ? null : Date.valueOf(request.dataVenda()));
        ps.setString(16, request.status().dbValue());
        ps.setString(17, emptyToNull(request.observacoes()));
    }

    private void ensureExists(Long id) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM veiculo WHERE id_veiculo = ?", Integer.class, id);
        if (count == null || count == 0) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Carro nao encontrado.");
        }
    }

    private void ensureUniqueFields(CarroDtos.CarroRequest request, Long currentId) {
        ensureUnique("placa", request.placa(), currentId, "Ja existe um carro cadastrado com esta placa.");
        ensureUnique("chassi", request.chassi(), currentId, "Ja existe um carro cadastrado com este chassi.");
        ensureUnique("renavam", request.renavam(), currentId, "Ja existe um carro cadastrado com este renavam.");
    }

    private void ensureUnique(String column, String value, Long currentId, String message) {
        if (!TextNormalizer.hasText(value)) {
            return;
        }

        StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM veiculo WHERE LOWER(" + column + ") = LOWER(?)");
        List<Object> params = new ArrayList<>();
        params.add(value.trim());

        if (currentId != null) {
            sql.append(" AND id_veiculo <> ?");
            params.add(currentId);
        }

        Integer count = jdbcTemplate.queryForObject(sql.toString(), Integer.class, params.toArray());
        if (count != null && count > 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, message);
        }
    }

    private String emptyToNull(String value) {
        return TextNormalizer.hasText(value) ? value.trim() : null;
    }

    private record CarroRow(
            Long id,
            String marca,
            String modelo,
            Integer ano,
            String placa,
            String cor,
            String categoria,
            String chassi,
            String renavam,
            Long quilometragem,
            StatusCarro status,
            BigDecimal valorCompra,
            BigDecimal valorVenda,
            LocalDate dataCompra,
            LocalDate dataVenda,
            String observacoes,
            LocalDateTime criadoEm,
            LocalDateTime atualizadoEm
    ) {
    }
}
