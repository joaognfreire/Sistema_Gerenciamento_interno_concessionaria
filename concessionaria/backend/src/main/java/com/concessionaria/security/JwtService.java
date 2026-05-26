package com.concessionaria.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class JwtService {
    private static final Base64.Encoder BASE64_URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder BASE64_URL_DECODER = Base64.getUrlDecoder();

    private final ObjectMapper objectMapper;
    private final byte[] secret;
    private final long expirationMinutes;

    public JwtService(
            ObjectMapper objectMapper,
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-minutes}") long expirationMinutes
    ) {
        this.objectMapper = objectMapper;
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.expirationMinutes = expirationMinutes;
    }

    public Token createToken(AuthenticatedUser user) {
        Instant expiresAt = Instant.now().plusSeconds(expirationMinutes * 60);
        Map<String, Object> header = new LinkedHashMap<>();
        header.put("alg", "HS256");
        header.put("typ", "JWT");

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sub", user.id());
        payload.put("nome", user.nome());
        payload.put("cargo", user.cargo().name());
        payload.put("exp", expiresAt.getEpochSecond());

        String token = encodeJson(header) + "." + encodeJson(payload);
        String signature = sign(token);
        return new Token(token + "." + signature, expiresAt);
    }

    public Optional<TokenClaims> verify(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return Optional.empty();
            }

            String content = parts[0] + "." + parts[1];
            String expectedSignature = sign(content);
            if (!MessageDigest.isEqual(expectedSignature.getBytes(StandardCharsets.UTF_8), parts[2].getBytes(StandardCharsets.UTF_8))) {
                return Optional.empty();
            }

            byte[] payloadBytes = BASE64_URL_DECODER.decode(parts[1]);
            Map<String, Object> payload = objectMapper.readValue(payloadBytes, new TypeReference<>() {
            });

            long expiresAt = ((Number) payload.get("exp")).longValue();
            if (Instant.now().isAfter(Instant.ofEpochSecond(expiresAt))) {
                return Optional.empty();
            }

            Long userId = ((Number) payload.get("sub")).longValue();
            return Optional.of(new TokenClaims(userId, Instant.ofEpochSecond(expiresAt)));
        } catch (Exception ex) {
            return Optional.empty();
        }
    }

    private String encodeJson(Map<String, Object> value) {
        try {
            return BASE64_URL_ENCODER.encodeToString(objectMapper.writeValueAsBytes(value));
        } catch (Exception ex) {
            throw new IllegalStateException("Nao foi possivel gerar token.", ex);
        }
    }

    private String sign(String content) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            return BASE64_URL_ENCODER.encodeToString(mac.doFinal(content.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("Nao foi possivel assinar token.", ex);
        }
    }

    public record Token(String value, Instant expiresAt) {
    }

    public record TokenClaims(Long userId, Instant expiresAt) {
    }
}
