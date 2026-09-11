package com.Xylem.Mjolnir.dto;

import java.time.Instant;

import com.Xylem.Mjolnir.model.ContactType;
import com.Xylem.Mjolnir.model.CurrentCustody;
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
                @Size(max = 2048) String pictureUrl,
                CurrentCustody currentCustody,
                @Size(max = 200) String custodyLocation,
                ContactType contactType,
                @Size(max = 200) String contactValue,
                Instant lostAt,
                Instant foundAt) {

        public CreatePostRequest(String title, String description, String category, PostType type,
                                 String location, String pictureUrl) {
                this(title, description, category, type, location, pictureUrl, null, null, null, null, null, null);
        }
}
