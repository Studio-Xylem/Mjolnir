package com.Xylem.Mjolnir.dto;

import java.util.List;

public record LostPostCreationResponse(PostResponse post, List<PostResponse> matches) {
}