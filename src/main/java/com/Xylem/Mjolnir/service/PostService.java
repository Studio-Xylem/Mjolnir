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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        postRepository.save(post);
        return post;
    }

    public Post getById(String id) {
        Post post = postRepository.findById(id).orElse(null);
        if (post == null) {
            throw new NotFoundException("Post not found");
        }
        return post;
    }

    public List<Post> getActive(PostType type) {
        return type == null ? postRepository.findAllActive() : postRepository.findByType(type);
    }

    public List<Post> getMine(AuthenticatedUser user) {
        return postRepository.findByUserId(user.uid());
    }

    @Transactional
    public void resolve(AuthenticatedUser user, String id) {
        Post post = getById(id);
        if (!post.getUserId().equals(user.uid())) {
            throw new ForbiddenException("Only the post owner can resolve this post");
        }
        ResolutionResult result = postRepository.resolveIfActive(id);
        if (result == ResolutionResult.NOT_FOUND) {
            throw new NotFoundException("Post not found");
        }
        if (result == ResolutionResult.ALREADY_RESOLVED) {
            throw new ConflictException("A resolved post cannot be resolved again");
        }
    }
}
