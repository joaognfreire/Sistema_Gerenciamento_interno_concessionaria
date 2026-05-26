package com.concessionaria.security;

import com.concessionaria.common.TextNormalizer;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Cargo {
    COLABORADOR(1, "Colaborador"),
    GERENTE(2, "Gerente"),
    GERENTE_FINANCEIRO(3, "Gerente Financeiro"),
    DONO(4, "Dono");

    private final int nivel;
    private final String dbValue;

    Cargo(int nivel, String dbValue) {
        this.nivel = nivel;
        this.dbValue = dbValue;
    }

    public boolean atLeast(Cargo minimo) {
        return this.nivel >= minimo.nivel;
    }

    public String dbValue() {
        return dbValue;
    }

    @JsonCreator
    public static Cargo fromJson(String value) {
        String key = TextNormalizer.enumKey(value);
        if ("GERENTE_FINANCEIRO".equals(key) || "FINANCEIRO".equals(key)) {
            return GERENTE_FINANCEIRO;
        }

        for (Cargo cargo : values()) {
            if (cargo.name().equals(key)) {
                return cargo;
            }
        }

        throw new IllegalArgumentException("Cargo invalido: " + value);
    }

    @JsonValue
    public String toJson() {
        return name();
    }
}
