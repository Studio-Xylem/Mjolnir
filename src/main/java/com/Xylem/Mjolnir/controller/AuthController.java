package com.Xylem.Mjolnir.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.Xylem.Mjolnir.dto.AuthResponse;
import com.Xylem.Mjolnir.dto.LoginRequest;
import com.Xylem.Mjolnir.dto.RegisterRequest;
import com.Xylem.Mjolnir.dto.UserResponse;
import com.Xylem.Mjolnir.security.CurrentUser;
import com.Xylem.Mjolnir.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
    private final com.Xylem.Mjolnir.security.JwtService jwtService;

    public AuthController(UserService userService, com.Xylem.Mjolnir.security.JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        UserResponse user = UserResponse.from(userService.register(request));
        return new AuthResponse(jwtService.createToken(user.id(), user.username()), user);
    }

    @PostMapping("/login")
    AuthResponse login(@Valid @RequestBody LoginRequest request) {
        UserResponse user = UserResponse.from(userService.authenticate(request));
        return new AuthResponse(jwtService.createToken(user.id(), user.username()), user);
    }

    @GetMapping("/me")
    UserResponse me() {
        return UserResponse.from(userService.getCurrent(CurrentUser.require()));
    }
}
