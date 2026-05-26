package com.concessionaria.relatorio;

import com.concessionaria.common.TextNormalizer;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum StatusRelatorio {
    PENDENTE("Pendente"),
    EM_ANALISE("Em Analise"),
    RESOLVIDO("Resolvido"),
    ARQUIVADO("Arquivado");

    private final String dbValue;

    StatusRelatorio(String dbValue) {
        this.dbValue = dbValue;
    }

    public String dbValue() {
        return dbValue;
    }

    @JsonCreator
    public static StatusRelatorio fromJson(String value) {
        String key = TextNormalizer.enumKey(value);
        if ("EM_ANALISE".equals(key) || "ANALISE".equals(key)) {
            return EM_ANALISE;
        }

        for (StatusRelatorio status : values()) {
            if (status.name().equals(key)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Status de relatorio invalido: " + value);
    }

    @JsonValue
    public String toJson() {
        return name();
    }
}
