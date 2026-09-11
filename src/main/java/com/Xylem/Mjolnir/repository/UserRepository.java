package com.Xylem.Mjolnir.repository;

import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.Xylem.Mjolnir.model.User;
import com.google.cloud.firestore.Firestore;

@Repository
public class UserRepository {
	private final Firestore firestore;

	public UserRepository(Firestore firestore) {
		this.firestore = firestore;
	}

	public Optional<User> findById(String id) {
		try {
			var snapshot = firestore.collection("users").document(id).get().get();
			if (!snapshot.exists()) return Optional.empty();
			User user = snapshot.toObject(User.class);
			user.setId(snapshot.getId());
			return Optional.of(user);
		} catch (Exception exception) {
			throw new IllegalStateException("Unable to read user", exception);
		}
	}

	public User save(User user) {
		try {
			firestore.collection("users").document(user.getId()).set(user).get();
			return user;
		} catch (Exception exception) {
			throw new IllegalStateException("Unable to save user", exception);
		}
	}
}