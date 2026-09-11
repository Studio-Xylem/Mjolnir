package com.Xylem.Mjolnir.repository;

import java.time.Duration;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.Xylem.Mjolnir.model.Post;
import com.Xylem.Mjolnir.model.PostStatus;
import com.Xylem.Mjolnir.model.PostType;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.Query;

@Repository
public class PostRepository {
    private final Firestore firestore;

    public PostRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    public Optional<Post> findById(String id) {
        try {
            return Optional.ofNullable(read(firestore.collection("posts").document(id).get().get()));
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Unable to read post", exception);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to read post", exception);
        }
    }

    public Post save(Post post) {
        try {
            if (post.getId() == null) post.setId(firestore.collection("posts").document().getId());
            if (post.getCreatedAt() == null) post.setCreatedAt(java.time.Instant.now());
            firestore.collection("posts").document(post.getId()).set(post).get();
            return post;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Unable to save post", exception);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to save post", exception);
        }
    }

    public void deleteById(String id) {
        try {
            firestore.collection("posts").document(id).delete().get();
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Unable to delete post", exception);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to delete post", exception);
        }
    }

    public List<Post> findByUserId(String userId) {
        return query(firestore.collection("posts").whereEqualTo("userId", userId));
    }

    public List<Post> findAllActive() {
        return query(firestore.collection("posts").whereEqualTo("status", PostStatus.ACTIVE.name()));
    }

    public List<Post> findByType(PostType type) {
        return query(firestore.collection("posts").whereEqualTo("type", type.name())
                .whereEqualTo("status", PostStatus.ACTIVE.name()));
    }

    public List<Post> findPotentialMatches(Post lostPost) {
        return findByType(PostType.FOUND).stream()
                .filter(foundPost -> isPotentialMatch(lostPost, foundPost))
                .toList();
    }

    private boolean isPotentialMatch(Post lostPost, Post foundPost) {
        if (!sameText(lostPost.getCategory(), foundPost.getCategory())) return false;
        if (!hasSharedTerm(lostPost.getTitle(), foundPost.getTitle())
                && !hasSharedTerm(lostPost.getLocation(), foundPost.getLocation())) return false;
        if (lostPost.getLostAt() == null || foundPost.getFoundAt() == null) return true;
        return Math.abs(Duration.between(lostPost.getLostAt(), foundPost.getFoundAt()).toDays()) <= 7;
    }

    private boolean sameText(String first, String second) {
        return first != null && second != null && first.trim().equalsIgnoreCase(second.trim());
    }

    private boolean hasSharedTerm(String first, String second) {
        if (first == null || second == null) return false;
        var secondTerms = java.util.Arrays.stream(second.toLowerCase().split("\\W+"))
                .filter(term -> term.length() >= 3)
                .collect(java.util.stream.Collectors.toSet());
        return java.util.Arrays.stream(first.toLowerCase().split("\\W+"))
                .filter(term -> term.length() >= 3)
                .anyMatch(secondTerms::contains);
    }

    public ResolutionResult resolveIfActive(String id) {
        try {
            return firestore.runTransaction(transaction -> {
                var reference = firestore.collection("posts").document(id);
                DocumentSnapshot snapshot = transaction.get(reference).get();
                if (!snapshot.exists()) return ResolutionResult.NOT_FOUND;
                Post post = snapshot.toObject(Post.class);
                if (post == null) return ResolutionResult.NOT_FOUND;
                if (post.getStatus() != PostStatus.ACTIVE) return ResolutionResult.ALREADY_RESOLVED;
                transaction.update(reference, "status", PostStatus.RESOLVED.name());
                return ResolutionResult.RESOLVED;
            }).get();
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to resolve post", exception);
        }
    }

    private List<Post> query(Query query) {
        try {
            return query.get().get().getDocuments().stream().map(this::read).toList();
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to read posts", exception);
        }
    }

    private Post read(DocumentSnapshot snapshot) {
        if (!snapshot.exists()) return null;
        Post post = snapshot.toObject(Post.class);
        if (post == null) return null;
        post.setId(snapshot.getId());
        return post;
    }
}