package com.Xylem.Mjolnir.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Xylem.Mjolnir.dto.CreatePostRequest;
import com.Xylem.Mjolnir.dto.UpdatePostRequest;
import com.Xylem.Mjolnir.exception.BadRequestException;
import com.Xylem.Mjolnir.exception.ConflictException;
import com.Xylem.Mjolnir.exception.ForbiddenException;
import com.Xylem.Mjolnir.exception.NotFoundException;
import com.Xylem.Mjolnir.model.ContactType;
import com.Xylem.Mjolnir.model.CurrentCustody;
import com.Xylem.Mjolnir.model.Post;
import com.Xylem.Mjolnir.model.PostType;
import com.Xylem.Mjolnir.repository.PostRepository;
import com.Xylem.Mjolnir.repository.ResolutionResult;
import com.Xylem.Mjolnir.security.AuthenticatedUser;

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
        applyCustody(post, request.type(), request.currentCustody(), request.custodyLocation(),
            request.contactType(), request.contactValue());
        applyEventTime(post, request.type(), request.lostAt(), request.foundAt());
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

    public List<Post> findMatches(Post lostPost) {
        return postRepository.findPotentialMatches(lostPost);
    }

    @Transactional
    public void resolve(AuthenticatedUser user, String id) {
        Post post = getById(id);
        if (post.getType() == PostType.FOUND) {
            throw new ConflictException("Found posts are placed in custody and cannot be resolved");
        }
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

    public Post update(AuthenticatedUser user, String id, UpdatePostRequest request) {
        Post post = getOwnedPost(user, id);
        post.setTitle(request.title().trim());
        post.setDescription(request.description().trim());
        post.setCategory(request.category().trim());
        post.setType(request.type());
        post.setLocation(request.location().trim());
        post.setPictureUrl(request.pictureUrl() == null ? "" : request.pictureUrl().trim());
        applyCustody(post, request.type(), request.currentCustody(), request.custodyLocation(),
            request.contactType(), request.contactValue());
        applyEventTime(post, request.type(), request.lostAt(), request.foundAt());
        return postRepository.save(post);
    }

    public void delete(AuthenticatedUser user, String id) {
        getOwnedPost(user, id);
        postRepository.deleteById(id);
    }

    private Post getOwnedPost(AuthenticatedUser user, String id) {
        Post post = getById(id);
        if (!post.getUserId().equals(user.uid())) {
            throw new ForbiddenException("Only the post owner can modify this post");
        }
        return post;
    }

    private void applyCustody(Post post, PostType type, CurrentCustody currentCustody, String custodyLocation,
                              ContactType contactType, String contactValue) {
        if (type != PostType.FOUND) {
            post.setCurrentCustody(null);
            post.setCustodyLocation("");
            post.setContactType(null);
            post.setContactValue("");
            return;
        }
        if (currentCustody == null) {
            throw new BadRequestException("Found posts require currentCustody");
        }
        String location = custodyLocation == null ? "" : custodyLocation.trim();
        String contact = contactValue == null ? "" : contactValue.trim();
        if (currentCustody == CurrentCustody.CUSTODY && location.isBlank()) {
            throw new BadRequestException("custodyLocation is required when currentCustody is CUSTODY");
        }
        if (currentCustody == CurrentCustody.SELF && (contactType == null || contact.isBlank())) {
            throw new BadRequestException("contactType and contactValue are required for SELF custody");
        }
        if (currentCustody == CurrentCustody.CUSTODY && (contactType != null || !contact.isBlank())) {
            throw new BadRequestException("Contact details are only allowed for SELF custody");
        }
        post.setCurrentCustody(currentCustody);
        post.setCustodyLocation(location);
        post.setContactType(contactType);
        post.setContactValue(contact);
    }

    private void applyEventTime(Post post, PostType type, java.time.Instant lostAt, java.time.Instant foundAt) {
        if (type == PostType.LOST) {
            if (lostAt == null) throw new BadRequestException("lostAt is required for LOST posts");
            post.setLostAt(lostAt);
            post.setFoundAt(null);
        } else {
            if (foundAt == null) throw new BadRequestException("foundAt is required for FOUND posts");
            post.setFoundAt(foundAt);
            post.setLostAt(null);
        }
    }
}
