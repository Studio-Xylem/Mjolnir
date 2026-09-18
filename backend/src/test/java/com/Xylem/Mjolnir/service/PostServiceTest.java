package com.Xylem.Mjolnir.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.Xylem.Mjolnir.dto.CreatePostRequest;
import com.Xylem.Mjolnir.dto.UpdatePostRequest;
import com.Xylem.Mjolnir.exception.ConflictException;
import com.Xylem.Mjolnir.exception.ForbiddenException;
import com.Xylem.Mjolnir.model.CurrentCustody;
import com.Xylem.Mjolnir.model.Post;
import com.Xylem.Mjolnir.model.PostType;
import com.Xylem.Mjolnir.repository.PostRepository;
import com.Xylem.Mjolnir.repository.ResolutionResult;
import com.Xylem.Mjolnir.security.AuthenticatedUser;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {
    private final AuthenticatedUser owner = new AuthenticatedUser("owner-id", "owner@example.com", "Owner");

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserService userService;

    @Test
    void createAssignsTheAuthenticatedUserAsOwner() throws Exception {
        PostService service = new PostService(postRepository, userService);
        Post created = service.create(owner, new CreatePostRequest("  Wallet ", "  Black wallet ", "  Personal ",
            PostType.LOST, "  Library ", null, null, null, null, null,
            java.time.Instant.parse("2026-09-11T10:00:00Z"), null));

        ArgumentCaptor<Post> postCaptor = ArgumentCaptor.forClass(Post.class);
        verify(postRepository).save(postCaptor.capture());
        assertEquals("owner-id", postCaptor.getValue().getUserId());
        assertEquals("Wallet", created.getTitle());
        assertEquals("", created.getPictureUrl());
    }

    @Test
    void createRequiresCustodyDetailsForFoundPosts() {
        PostService service = new PostService(postRepository, userService);

        assertThrows(com.Xylem.Mjolnir.exception.BadRequestException.class, () -> service.create(owner,
                new CreatePostRequest("Wallet", "Black wallet", "Personal", PostType.FOUND,
                    "Library", null, CurrentCustody.CUSTODY, "   ", null, null, null, null)));
    }

    @Test
    void createStoresFoundPostCustody() {
        PostService service = new PostService(postRepository, userService);

        Post created = service.create(owner, new CreatePostRequest("Wallet", "Black wallet", "Personal",
            PostType.FOUND, "Library", null, CurrentCustody.CUSTODY, "Police station", null, null, null,
            java.time.Instant.parse("2026-09-11T10:00:00Z")));

        assertEquals(CurrentCustody.CUSTODY, created.getCurrentCustody());
        assertEquals("Police station", created.getCustodyLocation());
    }

    @Test
    void resolveAllowsOwnerExactlyOnce() throws Exception {
        PostService service = new PostService(postRepository, userService);
        Post post = new Post("owner-id", "Wallet", "Black", "Personal", PostType.LOST, "Library");
        post.setId("post-id");
        when(postRepository.findById("post-id")).thenReturn(Optional.of(post));
        when(postRepository.resolveIfActive("post-id")).thenReturn(ResolutionResult.RESOLVED);

        service.resolve(owner, "post-id");

        verify(postRepository).resolveIfActive("post-id");
    }

    @Test
    void resolveRejectsASecondResolution() throws Exception {
        PostService service = new PostService(postRepository, userService);
        Post post = new Post("owner-id", "Wallet", "Black", "Personal", PostType.LOST, "Library");
        when(postRepository.findById("post-id")).thenReturn(Optional.of(post));
        when(postRepository.resolveIfActive("post-id")).thenReturn(ResolutionResult.ALREADY_RESOLVED);

        assertThrows(ConflictException.class, () -> service.resolve(owner, "post-id"));
    }

    @Test
    void resolveRejectsANonOwner() throws Exception {
        PostService service = new PostService(postRepository, userService);
        Post post = new Post("owner-id", "Wallet", "Black", "Personal", PostType.LOST, "Library");
        when(postRepository.findById("post-id")).thenReturn(Optional.of(post));

        assertThrows(ForbiddenException.class,
                () -> service.resolve(new AuthenticatedUser("another-user", "other@example.com", "Other"), "post-id"));

        verify(postRepository, never()).resolveIfActive("post-id");
    }

    @Test
    void resolveRejectsFoundPosts() {
        PostService service = new PostService(postRepository, userService);
        Post post = new Post("owner-id", "Wallet", "Black", "Personal", PostType.FOUND, "Library");
        post.setId("post-id");
        when(postRepository.findById("post-id")).thenReturn(Optional.of(post));

        assertThrows(ConflictException.class, () -> service.resolve(owner, "post-id"));
        verify(postRepository, never()).resolveIfActive("post-id");
    }

    @Test
    void ownerCanUpdateAndDeletePost() {
        PostService service = new PostService(postRepository, userService);
        Post post = new Post("owner-id", "Wallet", "Black", "Personal", PostType.LOST, "Library");
        post.setId("post-id");
        when(postRepository.findById("post-id")).thenReturn(Optional.of(post));
        when(postRepository.save(post)).thenReturn(post);

        Post updated = service.update(owner, "post-id", new UpdatePostRequest("Keys", "Silver keys",
            "Personal", PostType.LOST, "Desk", null, null, null, null, null,
            java.time.Instant.parse("2026-09-11T10:00:00Z"), null));

        assertEquals("Keys", updated.getTitle());
        verify(postRepository).save(post);
        service.delete(owner, "post-id");
        verify(postRepository).deleteById("post-id");
    }
}
