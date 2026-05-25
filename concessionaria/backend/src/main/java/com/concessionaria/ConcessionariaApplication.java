package com.concessionaria;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@SpringBootApplication
public class ConcessionariaApplication {

    public static void main(String[] args) {
        System.setProperty("debug", System.getProperty("debug", "false"));
        SpringApplication app = new SpringApplication(ConcessionariaApplication.class);
        app.setDefaultProperties(loadDotenvDefaults());
        app.run(args);
    }

    private static Map<String, Object> loadDotenvDefaults() {
        Map<String, Object> defaults = new HashMap<>();
        List<Path> candidates = List.of(Path.of(".env"), Path.of("../.env"));

        for (Path candidate : candidates) {
            if (!Files.isRegularFile(candidate)) {
                continue;
            }

            try {
                for (String rawLine : Files.readAllLines(candidate, StandardCharsets.UTF_8)) {
                    String line = rawLine.trim();
                    if (line.isBlank() || line.startsWith("#") || !line.contains("=")) {
                        continue;
                    }

                    int separator = line.indexOf('=');
                    String key = line.substring(0, separator).trim();
                    String value = line.substring(separator + 1).trim();
                    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.substring(1, value.length() - 1);
                    }

                    if (!key.isBlank() && System.getenv(key) == null && System.getProperty(key) == null) {
                        defaults.putIfAbsent(key, value);
                    }
                }
            } catch (IOException ignored) {
                // Sem .env legivel, o Spring continua usando variaveis de ambiente ou os defaults.
            }
        }

        return defaults;
    }
}
