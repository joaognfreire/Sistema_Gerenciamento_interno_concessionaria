package com.concessionaria.common;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@RestController
public class ApiInfoController {

    @GetMapping({"/", "/api", "/api/health"})
    public Map<String, Object> info() {
        return Map.of(
                "sistema", "Concessionaria Backend",
                "status", "online",
                "dataHora", OffsetDateTime.now(),
                "endpoints", List.of(
                        "/api/auth/login",
                        "/api/auth/me",
                        "/api/dashboard",
                        "/api/colaboradores",
                        "/api/verificacoes/cpf",
                        "/api/carros",
                        "/api/relatorios",
                        "/api/financeiro"
                )
        );
    }
}
