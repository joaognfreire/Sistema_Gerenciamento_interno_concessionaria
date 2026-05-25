package com.concessionaria.colaborador;

import com.concessionaria.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/colaboradores")
public class ColaboradorController {
    private final ColaboradorService colaboradorService;

    public ColaboradorController(ColaboradorService colaboradorService) {
        this.colaboradorService = colaboradorService;
    }

    @GetMapping
    public List<ColaboradorDtos.ColaboradorResponse> list(
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) Boolean ativo
    ) {
        return colaboradorService.list(busca, ativo);
    }

    @GetMapping("/{id}")
    public ColaboradorDtos.ColaboradorResponse findById(@PathVariable Long id) {
        return colaboradorService.findById(id);
    }

    @PostMapping
    public ColaboradorDtos.ColaboradorResponse create(@Valid @RequestBody ColaboradorDtos.CreateColaboradorRequest request) {
        return colaboradorService.create(request);
    }

    @PutMapping("/{id}")
    public ColaboradorDtos.ColaboradorResponse update(
            @PathVariable Long id,
            @Valid @RequestBody ColaboradorDtos.UpdateColaboradorRequest request
    ) {
        return colaboradorService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ApiResponse delete(@PathVariable Long id) {
        colaboradorService.delete(id);
        return new ApiResponse("Colaborador excluido com sucesso.");
    }
}
