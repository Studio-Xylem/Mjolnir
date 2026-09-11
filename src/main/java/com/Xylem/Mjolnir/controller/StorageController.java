package com.Xylem.Mjolnir.controller;

import com.Xylem.Mjolnir.service.LocalStorageService;
import java.nio.file.Files;
import java.nio.file.Path;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/uploads")
public class StorageController {
    private final LocalStorageService storageService;

    public StorageController(LocalStorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    UploadResponse upload(@RequestPart("file") MultipartFile file) {
        return new UploadResponse(storageService.store(file, "posts"));
    }

    @GetMapping("/{folder}/{fileName:.+}")
    ResponseEntity<Resource> download(@PathVariable String folder, @PathVariable String fileName) throws Exception {
        Path file = storageService.resolve(folder, fileName);
        if (!Files.exists(file)) return ResponseEntity.notFound().build();
        Resource resource = new UrlResource(file.toUri());
        String contentType = Files.probeContentType(file);
        MediaType mediaType = contentType == null ? MediaType.APPLICATION_OCTET_STREAM : MediaType.parseMediaType(contentType);
        return ResponseEntity.ok().contentType(mediaType).body(resource);
    }

    record UploadResponse(String url) {
    }
}