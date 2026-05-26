package com.concessionaria.carro;

import com.concessionaria.common.TextNormalizer;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum StatusCarro {
    DISPONIVEL("Disponivel"),
    VENDIDO("Vendido"),
    MANUTENCAO("Manutencao");

    private final String dbValue;

    StatusCarro(String dbValue) {
        this.dbValue = dbValue;
    }

    public String dbValue() {
        return dbValue;
    }

    @JsonCreator
    public static StatusCarro fromJson(String value) {
        String key = TextNormalizer.enumKey(value);
        if ("DISPONIVEL".equals(key)) {
            return DISPONIVEL;
        }
        if ("VENDIDO".equals(key)) {
            return VENDIDO;
        }
        if ("MANUTENCAO".equals(key)) {
            return MANUTENCAO;
        }
        throw new IllegalArgumentException("Status de carro invalido: " + value);
    }

    @JsonValue
    public String toJson() {
        return name();
    }
}
