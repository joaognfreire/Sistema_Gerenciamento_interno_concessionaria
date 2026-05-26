package com.concessionaria.carro;

import com.concessionaria.common.ApiException;
import com.concessionaria.common.ApiResponse;
import com.concessionaria.common.RequestValidationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/carros")
public class CarroController {
    private final CarroService carroService;
    private final ObjectMapper objectMapper;
    private final RequestValidationService requestValidationService;

    public CarroController(CarroService carroService, ObjectMapper objectMapper, RequestValidationService requestValidationService) {
        this.carroService = carroService;
        this.objectMapper = objectMapper;
        this.requestValidationService = requestValidationService;
    }

    @GetMapping
    public List<CarroDtos.CarroResponse> list(
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) String status
    ) {
        return carroService.list(busca, parseStatus(status));
    }

    @GetMapping("/{id}")
    public CarroDtos.CarroResponse findById(@PathVariable Long id) {
        return carroService.findById(id);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public CarroDtos.CarroResponse createJson(@Valid @RequestBody CarroDtos.CarroRequest request) {
        return carroService.create(request, List.of());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CarroDtos.CarroResponse createMultipart(
            @RequestPart("dados") String dados,
            @RequestPart(value = "fotos", required = false) List<MultipartFile> fotos
    ) {
        return carroService.create(parseDados(dados), fotos);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public CarroDtos.CarroResponse updateJson(
            @PathVariable Long id,
            @Valid @RequestBody CarroDtos.CarroRequest request
    ) {
        return carroService.update(id, request, List.of());
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CarroDtos.CarroResponse updateMultipart(
            @PathVariable Long id,
            @RequestPart("dados") String dados,
            @RequestPart(value = "fotos", required = false) List<MultipartFile> fotos
    ) {
        return carroService.update(id, parseDados(dados), fotos);
    }

    @PostMapping(value = "/{id}/fotos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public List<CarroDtos.FotoResponse> addPhotos(
            @PathVariable Long id,
            @RequestPart("fotos") List<MultipartFile> fotos
    ) {
        return carroService.addPhotos(id, fotos);
    }

    @DeleteMapping("/{carroId}/fotos/{fotoId}")
    public ApiResponse removePhoto(@PathVariable Long carroId, @PathVariable Long fotoId) {
        carroService.removePhoto(carroId, fotoId);
        return new ApiResponse("Foto removida com sucesso.");
    }

    @DeleteMapping("/{id}")
    public ApiResponse delete(@PathVariable Long id) {
        carroService.delete(id);
        return new ApiResponse("Carro excluido com sucesso.");
    }

    private CarroDtos.CarroRequest parseDados(String dados) {
        try {
            return requestValidationService.validate(objectMapper.readValue(dados, CarroDtos.CarroRequest.class));
        } catch (Exception ex) {
            if (ex instanceof ApiException apiException) {
                throw apiException;
            }
            throw new ApiException(HttpStatus.BAD_REQUEST, "Dados do carro invalidos.");
        }
    }

    private StatusCarro parseStatus(String status) {
        if (status == null || status.isBlank() || "TODOS".equalsIgnoreCase(status)) {
            return null;
        }
        return StatusCarro.fromJson(status);
    }
}
