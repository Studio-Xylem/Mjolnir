package com.Xylem.Mjolnir.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "posts")
public class Post {
    @Id
    private String id;
    private String userId;
    private String title;
    private String description;
    private String pictureUrl;
    private String category;
    @Enumerated(EnumType.STRING)
    private PostType type;
    @Enumerated(EnumType.STRING)
    private PostStatus status;
    private String location;
    private String currentCustody;
    private Instant createdAt;

    protected Post() {
    }

    public Post(String userId, String title, String description, String category, PostType type, String location) {
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.category = category;
        this.type = type;
        this.location = location;
        this.status = PostStatus.ACTIVE;
        this.currentCustody = "";
    }

    @PrePersist
    void initializeDefaults() {
        if (id == null) id = UUID.randomUUID().toString();
        if (createdAt == null) createdAt = Instant.now();
        if (status == null) status = PostStatus.ACTIVE;
        if (pictureUrl == null) pictureUrl = "";
        if (currentCustody == null) currentCustody = "";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPictureUrl() { return pictureUrl; }
    public void setPictureUrl(String pictureUrl) { this.pictureUrl = pictureUrl; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public PostType getType() { return type; }
    public void setType(PostType type) { this.type = type; }
    public PostStatus getStatus() { return status; }
    public void setStatus(PostStatus status) { this.status = status; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getCurrentCustody() { return currentCustody; }
    public void setCurrentCustody(String currentCustody) { this.currentCustody = currentCustody; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}