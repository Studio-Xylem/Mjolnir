package com.Xylem.Mjolnir.service;

import com.Xylem.Mjolnir.dto.CreatePostRequest;
import com.Xylem.Mjolnir.exception.ConflictException;
import com.Xylem.Mjolnir.exception.ForbiddenException;
import com.Xylem.Mjolnir.exception.NotFoundException;
import com.Xylem.Mjolnir.model.Post;
import com.Xylem.Mjolnir.model.PostType;
import com.Xylem.Mjolnir.repository.PostRepository;
import com.Xylem.Mjolnir.repository.ResolutionResult;
import com.Xylem.Mjolnir.security.AuthenticatedUser;
import java.util.List;
import java.util.concurrent.ExecutionException;
import org.springframework.stereotype.Service;

@Service
public class PostService {
    private final PostRepository postRepository;
    private final UserService userService;

    public PostService(PostRepository postRepository, UserService userService) {
        this.postRepository = postRepository;
        this.userService = userService;
    }

    public Post create(AuthenticatedUser user, CreatePostRequest request) {
        userService.getCurrent(user);
        Post post = new Post(user.uid(), request.title().trim(), request.description().trim(),
                request.category().trim(), request.type(), request.location().trim());
        post.setPictureUrl(request.pictureUrl() == null ? "" : request.pictureUrl().trim());
        try {
            postRepository.save(post);
            return post;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted while accessing Firestore", exception);
        } catch (ExecutionException exception) {
            throw new IllegalStateException("Unable to access Firestore", exception);
        }
    }

    public Post getById(String id) {
        try {
            Post post = postRepository.findById(id);
            if (post == null) {
                throw new NotFoundException("Post not found");
            }
            return post;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted while accessing Firestore", exception);
        } catch (ExecutionException exception) {
            throw new IllegalStateException("Unable to access Firestore", exception);
        }
    }

    public List<Post> getActive(PostType type) {
        try {
            return type == null ? postRepository.findAllActive() : postRepository.findByType(type);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted while accessing Firestore", exception);
        } catch (ExecutionException exception) {
            throw new IllegalStateException("Unable to access Firestore", exception);
        }
    }

    public List<Post> getMine(AuthenticatedUser user) {
        try {
            return postRepository.findByUserId(user.uid());
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted while accessing Firestore", exception);
        } catch (ExecutionException exception) {
            throw new IllegalStateException("Unable to access Firestore", exception);
        }
    }

    public void resolve(AuthenticatedUser user, String id) {
        Post post = getById(id);
        if (!post.getUserId().equals(user.uid())) {
            throw new ForbiddenException("Only the post owner can resolve this post");
        }
        try {
            ResolutionResult result = postRepository.resolveIfActive(id);
            if (result == ResolutionResult.NOT_FOUND) {
                throw new NotFoundException("Post not found");
            }
            if (result == ResolutionResult.ALREADY_RESOLVED) {
                throw new ConflictException("A resolved post cannot be resolved again");
            }
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted while accessing Firestore", exception);
        } catch (ExecutionException exception) {
            throw new IllegalStateException("Unable to access Firestore", exception);
        }
    }
}
