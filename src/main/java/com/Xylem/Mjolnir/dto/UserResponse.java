package com.Xylem.Mjolnir.dto;

import com.Xylem.Mjolnir.model.User;

public record UserResponse(String id, String username, String createdAt) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getUsername(),
                user.getCreatedAt() == null ? null : user.getCreatedAt().toString());
    }
}
