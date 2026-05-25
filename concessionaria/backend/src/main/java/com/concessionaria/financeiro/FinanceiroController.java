package com.concessionaria.financeiro;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/financeiro")
public class FinanceiroController {
    private final FinanceiroService financeiroService;

    public FinanceiroController(FinanceiroService financeiroService) {
        this.financeiroService = financeiroService;
    }

    @GetMapping("/resumo")
    public FinanceiroDtos.ResumoFinanceiroResponse resumo() {
        return financeiroService.resumo();
    }

    @GetMapping
    public List<FinanceiroDtos.RegistroFinanceiroResponse> list(@RequestParam(required = false) String tipo) {
        return financeiroService.list(parseTipo(tipo));
    }

    @PostMapping
    public FinanceiroDtos.RegistroFinanceiroResponse create(@Valid @RequestBody FinanceiroDtos.CreateRegistroFinanceiroRequest request) {
        return financeiroService.create(request);
    }

    private TipoFinanceiro parseTipo(String tipo) {
        if (tipo == null || tipo.isBlank() || "TODOS".equalsIgnoreCase(tipo)) {
            return null;
        }
        return TipoFinanceiro.fromJson(tipo);
    }
}
