package com.Xylem.Mjolnir.controller;

import com.Xylem.Mjolnir.service.LocalStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/uploads")
public class LocalStorageController {
    private final LocalStorageService storageService;

    public LocalStorageController(LocalStorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    UploadResponse upload(@RequestPart("file") MultipartFile file) {
        return new UploadResponse(storageService.store(file, "posts"));
    }

    record UploadResponse(String url) {
    }
}
