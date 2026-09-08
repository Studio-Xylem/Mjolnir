package com.Xylem.Mjolnir.controller;

import com.Xylem.Mjolnir.dto.RegisterRequest;
import com.Xylem.Mjolnir.dto.UserResponse;
import com.Xylem.Mjolnir.security.CurrentUser;
import com.Xylem.Mjolnir.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    UserResponse register(@Valid @RequestBody RegisterRequest request) {
        return UserResponse.from(userService.register(CurrentUser.require(), request));
    }

    @GetMapping("/me")
    UserResponse me() {
        return UserResponse.from(userService.getCurrent(CurrentUser.require()));
    }
}
