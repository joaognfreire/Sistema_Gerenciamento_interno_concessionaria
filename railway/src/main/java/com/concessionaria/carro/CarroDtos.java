package com.concessionaria.carro;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class CarroDtos {
    private CarroDtos() {
    }

    public record FotoResponse(
            Long id,
            String url,
            String nomeOriginal,
            String tipoConteudo,
            Boolean principal,
            Integer ordem
    ) {
    }

    public record CarroResponse(
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
            List<FotoResponse> fotos,
            FotoResponse fotoPrincipal,
            LocalDateTime criadoEm,
            LocalDateTime atualizadoEm
    ) {
    }

    public record CarroRequest(
            @NotBlank(message = "Marca e obrigatoria")
            String marca,

            @NotBlank(message = "Modelo e obrigatorio")
            String modelo,

            @NotNull(message = "Ano e obrigatorio")
            @Min(value = 1900, message = "Ano invalido")
            Integer ano,

            @NotBlank(message = "Placa e obrigatoria")
            String placa,

            @NotBlank(message = "Cor e obrigatoria")
            String cor,

            @NotBlank(message = "Categoria e obrigatoria")
            String categoria,

            @NotBlank(message = "Chassi e obrigatorio")
            String chassi,

            @NotBlank(message = "Renavam e obrigatorio")
            String renavam,

            @NotNull(message = "Quilometragem e obrigatoria")
            @Min(value = 0, message = "Quilometragem deve ser positiva")
            Long quilometragem,

            @NotNull(message = "Status e obrigatorio")
            StatusCarro status,

            @NotNull(message = "Valor de compra e obrigatorio")
            @DecimalMin(value = "0.0", inclusive = true, message = "Valor de compra deve ser positivo")
            BigDecimal valorCompra,

            @DecimalMin(value = "0.0", inclusive = true, message = "Valor de venda deve ser positivo")
            BigDecimal valorVenda,

            @NotNull(message = "Data de compra e obrigatoria")
            LocalDate dataCompra,

            LocalDate dataVenda,
            String observacoes,
            List<Long> removerFotoIds
    ) {
    }
}
