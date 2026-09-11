package com.Xylem.Mjolnir.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.Xylem.Mjolnir.dto.CreatePostRequest;
import com.Xylem.Mjolnir.dto.LostPostCreationResponse;
import com.Xylem.Mjolnir.dto.PostResponse;
import com.Xylem.Mjolnir.dto.UpdatePostRequest;
import com.Xylem.Mjolnir.model.PostType;
import com.Xylem.Mjolnir.security.CurrentUser;
import com.Xylem.Mjolnir.service.PostService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping({"", "/public"})
    List<PostResponse> getActive(@RequestParam(required = false) PostType type) {
        return postService.getActive(type).stream().map(PostResponse::from).toList();
    }

    @GetMapping("/mine")
    List<PostResponse> getMine() {
        return postService.getMine(CurrentUser.require()).stream().map(PostResponse::from).toList();
    }

    @GetMapping("/{id}")
    PostResponse getById(@PathVariable String id) {
        return PostResponse.from(postService.getById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    PostResponse create(@Valid @RequestBody CreatePostRequest request) {
        return PostResponse.from(postService.create(CurrentUser.require(), request));
    }

    @PostMapping("/lost")
    @ResponseStatus(HttpStatus.CREATED)
    LostPostCreationResponse createLost(@Valid @RequestBody CreatePostRequest request) {
        if (request.type() != PostType.LOST) {
            throw new com.Xylem.Mjolnir.exception.BadRequestException("The /lost endpoint only accepts LOST posts");
        }
        PostResponse post = PostResponse.from(postService.create(CurrentUser.require(), request));
        return new LostPostCreationResponse(post,
                postService.findMatches(postService.getById(post.id())).stream().map(PostResponse::from).toList());
    }

    @PatchMapping("/{id}")
    PostResponse update(@PathVariable String id, @Valid @RequestBody UpdatePostRequest request) {
        return PostResponse.from(postService.update(CurrentUser.require(), id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void delete(@PathVariable String id) {
        postService.delete(CurrentUser.require(), id);
    }

    @PatchMapping("/{id}/resolve")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void resolve(@PathVariable String id) {
        postService.resolve(CurrentUser.require(), id);
    }
}
