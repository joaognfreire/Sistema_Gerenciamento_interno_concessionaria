package com.concessionaria.storage;

import com.concessionaria.common.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

@Service
public class FileStorageService {
    private final Path uploadRoot;

    public FileStorageService(@Value("${app.upload-dir}") String uploadDir) {
        this.uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadRoot);
        } catch (IOException ex) {
            throw new IllegalStateException("Nao foi possivel criar diretorio de uploads.", ex);
        }
    }

    public StoredFile storeCarPhoto(Long carroId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Foto vazia ou invalida.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Apenas imagens podem ser enviadas como foto do carro.");
        }

        String originalName = file.getOriginalFilename() == null ? "foto" : file.getOriginalFilename();
        String extension = extensionOf(originalName);
        String filename = UUID.randomUUID() + extension;
        Path carFolder = uploadRoot.resolve(String.valueOf(carroId)).normalize();
        Path destination = carFolder.resolve(filename).normalize();

        if (!destination.startsWith(uploadRoot)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Nome de arquivo invalido.");
        }

        try {
            Files.createDirectories(carFolder);
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Nao foi possivel salvar a foto do carro.");
        }

        String url = "/uploads/" + carroId + "/" + filename;
        return new StoredFile(url, originalName, contentType);
    }

    public void deleteByUrl(String url) {
        if (url == null || !url.startsWith("/uploads/")) {
            return;
        }

        String relative = url.substring("/uploads/".length());
        Path path = uploadRoot.resolve(relative).normalize();
        if (!path.startsWith(uploadRoot)) {
            return;
        }

        try {
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
            // O registro no banco e removido mesmo que o arquivo fisico ja nao exista.
        }
    }

    private String extensionOf(String filename) {
        int index = filename.lastIndexOf('.');
        if (index < 0 || index == filename.length() - 1) {
            return "";
        }

        String extension = filename.substring(index).toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9.]", "");
        return extension.length() > 12 ? "" : extension;
    }

    public record StoredFile(String url, String originalName, String contentType) {
    }
}
