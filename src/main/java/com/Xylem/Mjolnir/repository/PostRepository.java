package com.Xylem.Mjolnir.repository;

import com.Xylem.Mjolnir.model.Post;
import com.Xylem.Mjolnir.model.PostStatus;
import com.Xylem.Mjolnir.model.PostType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, String> {
    default List<Post> findByUserId(String userId) {
        return findByUserIdOrderByCreatedAtDesc(userId);
    }

    default List<Post> findAllActive() {
        return findByStatusOrderByCreatedAtDesc(PostStatus.ACTIVE);
    }

    default List<Post> findByType(PostType type) {
        return findByTypeAndStatusOrderByCreatedAtDesc(type, PostStatus.ACTIVE);
    }

    List<Post> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Post> findByStatusOrderByCreatedAtDesc(PostStatus status);
    List<Post> findByTypeAndStatusOrderByCreatedAtDesc(PostType type, PostStatus status);

    @Modifying
    @Query("update Post p set p.status = :resolved where p.id = :id and p.status = :active")
    default ResolutionResult resolveIfActive(String id) {
        Post post = findById(id).orElse(null);
        if (post == null) return ResolutionResult.NOT_FOUND;
        if (post.getStatus() != PostStatus.ACTIVE) return ResolutionResult.ALREADY_RESOLVED;
        post.setStatus(PostStatus.RESOLVED);
        save(post);
        return ResolutionResult.RESOLVED;
    }
}