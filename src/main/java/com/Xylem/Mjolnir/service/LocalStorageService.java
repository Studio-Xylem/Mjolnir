package com.Xylem.Mjolnir.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class LocalStorageService {
    private final Path root;

    public LocalStorageService(@Value("${app.storage.location:./data/uploads}") String location) {
        root = Paths.get(location).toAbsolutePath().normalize();
    }

    public String store(MultipartFile file, String folder) {
        if (file.isEmpty()) throw new IllegalArgumentException("Uploaded file is empty");
        String safeFolder = folder == null || folder.isBlank() ? "posts" : folder.replaceAll("[^a-zA-Z0-9_-]", "");
        String originalName = file.getOriginalFilename() == null ? "file" : file.getOriginalFilename();
        String extension = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf('.')) : "";
        Path directory = root.resolve(safeFolder).normalize();
        if (!directory.startsWith(root)) throw new IllegalArgumentException("Invalid storage folder");
        try {
            Files.createDirectories(directory);
            Path destination = directory.resolve(UUID.randomUUID() + extension).normalize();
            file.transferTo(destination);
            return "/uploads/" + safeFolder + "/" + destination.getFileName();
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to store uploaded file", exception);
        }
    }
}
