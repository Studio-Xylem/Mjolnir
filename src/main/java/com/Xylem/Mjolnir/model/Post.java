package com.Xylem.Mjolnir.model;

import java.time.Instant;
import java.util.UUID;

public class Post {
    private String id;
    private String userId;
    private String title;
    private String description;
    private String pictureUrl;
    private String category;
    private PostType type;
    private PostStatus status;
    private String location;
    private CurrentCustody currentCustody;
    private String custodyLocation;
    private ContactType contactType;
    private String contactValue;
    private Instant lostAt;
    private Instant foundAt;
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
        this.custodyLocation = "";
        this.contactValue = "";
    }

    void initializeDefaults() {
        if (id == null) id = UUID.randomUUID().toString();
        if (createdAt == null) createdAt = Instant.now();
        if (status == null) status = PostStatus.ACTIVE;
        if (pictureUrl == null) pictureUrl = "";
        if (custodyLocation == null) custodyLocation = "";
        if (contactValue == null) contactValue = "";
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
    public CurrentCustody getCurrentCustody() { return currentCustody; }
    public void setCurrentCustody(CurrentCustody currentCustody) { this.currentCustody = currentCustody; }
    public String getCustodyLocation() { return custodyLocation; }
    public void setCustodyLocation(String custodyLocation) { this.custodyLocation = custodyLocation; }
    public ContactType getContactType() { return contactType; }
    public void setContactType(ContactType contactType) { this.contactType = contactType; }
    public String getContactValue() { return contactValue; }
    public void setContactValue(String contactValue) { this.contactValue = contactValue; }
    public Instant getLostAt() { return lostAt; }
    public void setLostAt(Instant lostAt) { this.lostAt = lostAt; }
    public Instant getFoundAt() { return foundAt; }
    public void setFoundAt(Instant foundAt) { this.foundAt = foundAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}