package com.Xylem.Mjolnir.service;

import com.Xylem.Mjolnir.dto.RegisterRequest;
import com.Xylem.Mjolnir.exception.ConflictException;
import com.Xylem.Mjolnir.exception.NotFoundException;
import com.Xylem.Mjolnir.model.User;
import com.Xylem.Mjolnir.repository.UserRepository;
import com.Xylem.Mjolnir.security.AuthenticatedUser;
import java.util.concurrent.ExecutionException;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User register(AuthenticatedUser authenticatedUser, RegisterRequest request) {
        try {
            User existing = userRepository.findById(authenticatedUser.uid());
            if (existing != null) {
                throw new ConflictException("A profile already exists for this Firebase account");
            }
            User user = new User(request.username().trim());
            user.setId(authenticatedUser.uid());
            userRepository.save(user);
            return user;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted while accessing Firestore", exception);
        } catch (ExecutionException exception) {
            throw new IllegalStateException("Unable to access Firestore", exception);
        }
    }

    public User getCurrent(AuthenticatedUser authenticatedUser) {
        try {
            User user = userRepository.findById(authenticatedUser.uid());
            if (user == null) {
                throw new NotFoundException("Create a profile with POST /api/auth/register first");
            }
            return user;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted while accessing Firestore", exception);
        } catch (ExecutionException exception) {
            throw new IllegalStateException("Unable to access Firestore", exception);
        }
    }
}
