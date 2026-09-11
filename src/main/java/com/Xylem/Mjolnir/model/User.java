package com.Xylem.Mjolnir.model;

import java.time.Instant;

public class User {
    private String id;
    private String username;
    private Instant createdAt;

    protected User() {
    }

    public User(String username) {
        this.username = username;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}