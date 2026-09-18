package com.Xylem.Mjolnir.dto;

import java.time.Instant;

import com.Xylem.Mjolnir.model.ContactType;
import com.Xylem.Mjolnir.model.CurrentCustody;
import com.Xylem.Mjolnir.model.Post;
import com.Xylem.Mjolnir.model.PostStatus;
import com.Xylem.Mjolnir.model.PostType;

public record PostResponse(String id, String userId, String title, String description, String pictureUrl,
                           String category, PostType type, PostStatus status, String location,
                           CurrentCustody currentCustody, String custodyLocation, ContactType contactType,
                           String contactValue, Instant lostAt, Instant foundAt, String createdAt) {
    public static PostResponse from(Post post) {
        return new PostResponse(post.getId(), post.getUserId(), post.getTitle(), post.getDescription(),
                post.getPictureUrl(), post.getCategory(), post.getType(), post.getStatus(), post.getLocation(),
                post.getCurrentCustody(), post.getCustodyLocation(), post.getContactType(), post.getContactValue(),
                post.getLostAt(), post.getFoundAt(),
                post.getCreatedAt() == null ? null : post.getCreatedAt().toString());
    }
}
