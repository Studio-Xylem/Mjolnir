package com.Xylem.Mjolnir.repository;

import com.Xylem.Mjolnir.model.Post;
import com.Xylem.Mjolnir.model.PostStatus;
import com.Xylem.Mjolnir.model.PostType;
import java.time.Duration;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, String> {
    List<Post> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Post> findByStatusOrderByCreatedAtDesc(PostStatus status);
    List<Post> findByTypeAndStatusOrderByCreatedAtDesc(PostType type, PostStatus status);

    default List<Post> findByUserId(String userId) { return findByUserIdOrderByCreatedAtDesc(userId); }
    default List<Post> findAllActive() { return findByStatusOrderByCreatedAtDesc(PostStatus.ACTIVE); }
    default List<Post> findByType(PostType type) { return findByTypeAndStatusOrderByCreatedAtDesc(type, PostStatus.ACTIVE); }

    @Modifying
    @Query("update Post p set p.status = :resolved where p.id = :id and p.status = :active")
    int markResolved(@Param("id") String id, @Param("active") PostStatus active,
                     @Param("resolved") PostStatus resolved);

    default ResolutionResult resolveIfActive(String id) {
        Post post = findById(id).orElse(null);
        if (post == null) return ResolutionResult.NOT_FOUND;
        if (post.getStatus() != PostStatus.ACTIVE) return ResolutionResult.ALREADY_RESOLVED;
        return markResolved(id, PostStatus.ACTIVE, PostStatus.RESOLVED) == 1
                ? ResolutionResult.RESOLVED : ResolutionResult.ALREADY_RESOLVED;
    }

        default List<Post> findPotentialMatches(Post lostPost) {
        return findByType(PostType.FOUND).stream()
            .filter(found -> same(lostPost.getCategory(), found.getCategory()))
            .filter(found -> sharedTerm(lostPost.getTitle(), found.getTitle())
                || sharedTerm(lostPost.getLocation(), found.getLocation()))
            .filter(found -> lostPost.getLostAt() == null || found.getFoundAt() == null
                || Math.abs(Duration.between(lostPost.getLostAt(), found.getFoundAt()).toDays()) <= 7)
            .toList();
        }

        private static boolean same(String first, String second) {
        return first != null && second != null && first.trim().equalsIgnoreCase(second.trim());
        }

        private static boolean sharedTerm(String first, String second) {
        if (first == null || second == null) return false;
        var terms = java.util.Arrays.stream(second.toLowerCase().split("\\W+"))
            .filter(term -> term.length() >= 3).collect(java.util.stream.Collectors.toSet());
        return java.util.Arrays.stream(first.toLowerCase().split("\\W+"))
            .filter(term -> term.length() >= 3).anyMatch(terms::contains);
        }
}
