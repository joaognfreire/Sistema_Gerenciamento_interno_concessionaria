package com.concessionaria.common;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

/**
 * Utilitário para trabalhar com datas/horas no timezone de Brasília (America/Sao_Paulo)
 */
public class BrazilTime {
    private static final ZoneId BRAZIL_ZONE = ZoneId.of("America/Sao_Paulo");

    /**
     * Retorna a data/hora atual no timezone de Brasília
     */
    public static LocalDateTime now() {
        return LocalDateTime.now(BRAZIL_ZONE);
    }

    /**
     * Retorna a data/hora atual no timezone de Brasília como ZonedDateTime
     */
    public static ZonedDateTime nowZoned() {
        return ZonedDateTime.now(BRAZIL_ZONE);
    }

    /**
     * Converte um LocalDateTime para o timezone de Brasília
     */
    public static LocalDateTime toSaoPaulo(LocalDateTime dateTime) {
        if (dateTime == null) return null;
        return dateTime.atZone(ZoneId.systemDefault())
                .withZoneSameInstant(BRAZIL_ZONE)
                .toLocalDateTime();
    }

    /**
     * Retorna o timezone de Brasília
     */
    public static ZoneId getZone() {
        return BRAZIL_ZONE;
    }
}
