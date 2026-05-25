package com.concessionaria.security;

import com.concessionaria.common.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class PermissionService {

    public AuthenticatedUser requireAuthenticated() {
        return CurrentUser.get()
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Faca login para continuar."));
    }

    public AuthenticatedUser requireRole(Cargo minimumRole) {
        AuthenticatedUser user = requireAuthenticated();
        if (!user.cargo().atLeast(minimumRole)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Voce nao tem permissao para acessar este recurso.");
        }
        return user;
    }

    public AuthenticatedUser requireOwner() {
        return requireRole(Cargo.DONO);
    }

    public boolean isManagerOrAbove(AuthenticatedUser user) {
        return user.cargo().atLeast(Cargo.GERENTE);
    }

    public boolean isFinanceManagerOrAbove(AuthenticatedUser user) {
        return user.cargo().atLeast(Cargo.GERENTE_FINANCEIRO);
    }
}
