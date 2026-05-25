package com.concessionaria.relatorio;

import com.concessionaria.common.TextNormalizer;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum PrioridadeRelatorio {
    BAIXA("Baixa"),
    MEDIA("Media"),
    ALTA("Alta"),
    URGENTE("Urgente");

    private final String dbValue;

    PrioridadeRelatorio(String dbValue) {
        this.dbValue = dbValue;
    }

    public String dbValue() {
        return dbValue;
    }

    @JsonCreator
    public static PrioridadeRelatorio fromJson(String value) {
        String key = TextNormalizer.enumKey(value);
        for (PrioridadeRelatorio prioridade : values()) {
            if (prioridade.name().equals(key)) {
                return prioridade;
            }
        }
        throw new IllegalArgumentException("Prioridade invalida: " + value);
    }

    @JsonValue
    public String toJson() {
        return name();
    }
}
