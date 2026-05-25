package com.concessionaria.common;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RequestValidationService {
    private final Validator validator;

    public RequestValidationService(Validator validator) {
        this.validator = validator;
    }

    public <T> T validate(T request) {
        Set<ConstraintViolation<T>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            String message = violations.stream()
                    .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
                    .collect(Collectors.joining("; "));
            throw new ApiException(HttpStatus.BAD_REQUEST, message);
        }
        return request;
    }
}
