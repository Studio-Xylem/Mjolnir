package com.Xylem.Mjolnir.repository;

import com.Xylem.Mjolnir.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, String> {
}