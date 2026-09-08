package com.Xylem.Mjolnir.dto;

import com.Xylem.Mjolnir.model.PostType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreatePostRequest(
        @NotBlank @Size(max = 120) String title,
        @NotBlank @Size(max = 2000) String description,
        @NotBlank @Size(max = 80) String category,
        @NotNull PostType type,
        @NotBlank @Size(max = 200) String location,
        @Size(max = 2048) String pictureUrl) {
}
