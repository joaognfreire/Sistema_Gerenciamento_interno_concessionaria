package com.concessionaria.financeiro;

import jakarta.validation.Valid;
import com.concessionaria.common.ApiResponse;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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
    public List<FinanceiroDtos.RegistroFinanceiroResponse> list(
            @RequestParam(required = false) String tipo,
            @RequestParam(defaultValue = "false") Boolean apagado
    ) {
        return financeiroService.list(parseTipo(tipo), apagado);
    }

    @PostMapping
    public FinanceiroDtos.RegistroFinanceiroResponse create(@Valid @RequestBody FinanceiroDtos.CreateRegistroFinanceiroRequest request) {
        return financeiroService.create(request);
    }

    @PutMapping("/{id}")
    public FinanceiroDtos.RegistroFinanceiroResponse update(
            @PathVariable Long id,
            @Valid @RequestBody FinanceiroDtos.UpdateRegistroFinanceiroRequest request
    ) {
        return financeiroService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ApiResponse delete(@PathVariable Long id) {
        financeiroService.delete(id);
        return new ApiResponse("Registro financeiro apagado com sucesso.");
    }

    @PatchMapping("/{id}/restaurar")
    public FinanceiroDtos.RegistroFinanceiroResponse restore(@PathVariable Long id) {
        return financeiroService.restore(id);
    }

    private TipoFinanceiro parseTipo(String tipo) {
        if (tipo == null || tipo.isBlank() || "TODOS".equalsIgnoreCase(tipo)) {
            return null;
        }
        return TipoFinanceiro.fromJson(tipo);
    }
}
