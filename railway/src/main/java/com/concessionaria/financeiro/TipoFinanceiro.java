package com.concessionaria.financeiro;

import com.concessionaria.common.TextNormalizer;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TipoFinanceiro {
    ENTRADA("Entrada"),
    SAIDA("Saida");

    private final String dbValue;

    TipoFinanceiro(String dbValue) {
        this.dbValue = dbValue;
    }

    public String dbValue() {
        return dbValue;
    }

    @JsonCreator
    public static TipoFinanceiro fromJson(String value) {
        String key = TextNormalizer.enumKey(value);
        if ("ENTRADA".equals(key) || "ENTRADAS".equals(key)) {
            return ENTRADA;
        }
        if ("SAIDA".equals(key) || "SAIDAS".equals(key)) {
            return SAIDA;
        }
        throw new IllegalArgumentException("Tipo financeiro invalido: " + value);
    }

    @JsonValue
    public String toJson() {
        return name();
    }
}
