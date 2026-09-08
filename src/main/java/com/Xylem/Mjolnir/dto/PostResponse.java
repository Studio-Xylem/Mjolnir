package com.Xylem.Mjolnir.dto;

import com.Xylem.Mjolnir.model.Post;
import com.Xylem.Mjolnir.model.PostStatus;
import com.Xylem.Mjolnir.model.PostType;

public record PostResponse(String id, String userId, String title, String description, String pictureUrl,
                           String category, PostType type, PostStatus status, String location,
                           String currentCustody, String createdAt) {
    public static PostResponse from(Post post) {
        return new PostResponse(post.getId(), post.getUserId(), post.getTitle(), post.getDescription(),
                post.getPictureUrl(), post.getCategory(), post.getType(), post.getStatus(), post.getLocation(),
                post.getCurrentCustody(),
                post.getCreatedAt() == null ? null : post.getCreatedAt().toDate().toInstant().toString());
    }
}
