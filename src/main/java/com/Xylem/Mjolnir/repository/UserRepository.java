package com.Xylem.Mjolnir.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Xylem.Mjolnir.model.User;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmailIgnoreCase(String email);
}