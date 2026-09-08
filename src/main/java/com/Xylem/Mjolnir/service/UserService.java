package com.Xylem.Mjolnir.service;

import com.Xylem.Mjolnir.dto.RegisterRequest;
import com.Xylem.Mjolnir.exception.ConflictException;
import com.Xylem.Mjolnir.exception.NotFoundException;
import com.Xylem.Mjolnir.model.User;
import com.Xylem.Mjolnir.repository.UserRepository;
import com.Xylem.Mjolnir.security.AuthenticatedUser;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User register(AuthenticatedUser authenticatedUser, RegisterRequest request) {
        User existing = userRepository.findById(authenticatedUser.uid()).orElse(null);
        if (existing != null) {
            throw new ConflictException("A profile already exists for this account");
        }
        User user = new User(request.username().trim());
        user.setId(authenticatedUser.uid());
        return userRepository.save(user);
    }

    public User getCurrent(AuthenticatedUser authenticatedUser) {
        User user = userRepository.findById(authenticatedUser.uid()).orElse(null);
        if (user == null) {
            throw new NotFoundException("Create a profile with POST /api/auth/register first");
        }
        return user;
    }
}
