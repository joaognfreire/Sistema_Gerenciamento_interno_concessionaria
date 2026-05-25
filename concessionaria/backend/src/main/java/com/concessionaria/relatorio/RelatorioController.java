package com.concessionaria.relatorio;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {
    private final RelatorioService relatorioService;

    public RelatorioController(RelatorioService relatorioService) {
        this.relatorioService = relatorioService;
    }

    @GetMapping
    public List<RelatorioDtos.RelatorioResponse> list(@RequestParam(required = false) String status) {
        return relatorioService.list(parseStatus(status));
    }

    @GetMapping("/contadores")
    public RelatorioDtos.ContadoresResponse countByStatus() {
        return relatorioService.countByStatus();
    }

    @GetMapping("/{id}")
    public RelatorioDtos.RelatorioResponse findById(@PathVariable Long id) {
        return relatorioService.findById(id);
    }

    @PostMapping
    public RelatorioDtos.RelatorioResponse create(@Valid @RequestBody RelatorioDtos.CreateRelatorioRequest request) {
        return relatorioService.create(request);
    }

    @PatchMapping("/{id}/status")
    public RelatorioDtos.RelatorioResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody RelatorioDtos.StatusRequest request
    ) {
        return relatorioService.updateStatus(id, request.status());
    }

    @PostMapping("/{id}/resposta")
    public RelatorioDtos.RelatorioResponse responder(
            @PathVariable Long id,
            @Valid @RequestBody RelatorioDtos.RespostaRequest request
    ) {
        return relatorioService.responder(id, request.resposta());
    }

    @PostMapping("/{id}/arquivar")
    public RelatorioDtos.RelatorioResponse arquivar(@PathVariable Long id) {
        return relatorioService.arquivar(id);
    }

    private StatusRelatorio parseStatus(String status) {
        if (status == null || status.isBlank() || "TODOS".equalsIgnoreCase(status)) {
            return null;
        }
        return StatusRelatorio.fromJson(status);
    }
}
