package com.Xylem.Mjolnir.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.Xylem.Mjolnir.dto.LoginRequest;
import com.Xylem.Mjolnir.dto.RegisterRequest;
import com.Xylem.Mjolnir.exception.ConflictException;
import com.Xylem.Mjolnir.exception.NotFoundException;
import com.Xylem.Mjolnir.model.User;
import com.Xylem.Mjolnir.repository.UserRepository;
import com.Xylem.Mjolnir.security.AuthenticatedUser;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        User existing = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (existing != null) {
            throw new ConflictException("An account already exists for this email");
        }
        User user = new User(request.username().trim(), email, passwordEncoder.encode(request.password()));
        return userRepository.save(user);
    }

    public User authenticate(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email().trim().toLowerCase())
                .orElseThrow(() -> new com.Xylem.Mjolnir.exception.UnauthorizedException("Invalid email or password"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new com.Xylem.Mjolnir.exception.UnauthorizedException("Invalid email or password");
        }
        return user;
    }

    public User getCurrent(AuthenticatedUser authenticatedUser) {
        User user = userRepository.findById(authenticatedUser.uid()).orElse(null);
        if (user == null) {
            throw new NotFoundException("Create a profile with POST /api/auth/register first");
        }
        return user;
    }
}
