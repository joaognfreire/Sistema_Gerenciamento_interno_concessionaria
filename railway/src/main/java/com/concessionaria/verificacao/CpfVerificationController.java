package com.concessionaria.verificacao;

import com.concessionaria.common.BrazilianCpf;
import com.concessionaria.security.Cargo;
import com.concessionaria.security.PermissionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/verificacoes")
public class CpfVerificationController {
    private final PermissionService permissionService;

    public CpfVerificationController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @GetMapping("/cpf")
    public CpfVerificationResponse verifyCpf(@RequestParam String cpf) {
        permissionService.requireRole(Cargo.GERENTE);
        boolean valid = BrazilianCpf.isValid(cpf);
        return new CpfVerificationResponse(
                BrazilianCpf.digits(cpf),
                valid ? BrazilianCpf.format(cpf) : cpf,
                valid,
                valid ? "CPF valido." : "CPF invalido."
        );
    }

    public record CpfVerificationResponse(
            String digits,
            String formatted,
            boolean valid,
            String message
    ) {
    }
}
