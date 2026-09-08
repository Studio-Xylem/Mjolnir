package com.Xylem.Mjolnir.repository;

import com.Xylem.Mjolnir.model.User;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.WriteResult;
import com.google.api.core.ApiFuture;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Repository
public class UserRepository {
    private static final String COLLECTION_NAME = "users";
    
    private final Firestore firestore;

    public UserRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    public String save(User user) throws ExecutionException, InterruptedException {
        DocumentReference document = user.getId() == null || user.getId().isBlank()
                ? firestore.collection(COLLECTION_NAME).document()
                : firestore.collection(COLLECTION_NAME).document(user.getId());
        user.setId(document.getId());
        ApiFuture<WriteResult> future = document.set(user);
        future.get();
        return user.getId();
    }

    public User findById(String id) throws ExecutionException, InterruptedException {
        ApiFuture<com.google.cloud.firestore.DocumentSnapshot> future = firestore.collection(COLLECTION_NAME).document(id).get();
        com.google.cloud.firestore.DocumentSnapshot document = future.get();
        if (document.exists()) {
            return document.toObject(User.class);
        }
        return null;
    }

    public User findByUsername(String username) throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("username", username)
                .limit(1)
                .get();
        QuerySnapshot querySnapshot = future.get();
        for (QueryDocumentSnapshot document : querySnapshot.getDocuments()) {
            return document.toObject(User.class);
        }
        return null;
    }

    public List<User> findAll() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME).get();
        QuerySnapshot querySnapshot = future.get();
        List<User> users = new ArrayList<>();
        for (QueryDocumentSnapshot document : querySnapshot.getDocuments()) {
            users.add(document.toObject(User.class));
        }
        return users;
    }

    public void deleteById(String id) throws ExecutionException, InterruptedException {
        ApiFuture<WriteResult> future = firestore.collection(COLLECTION_NAME).document(id).delete();
        future.get();
    }
}
