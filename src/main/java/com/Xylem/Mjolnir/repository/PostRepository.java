package com.Xylem.Mjolnir.repository;

import com.Xylem.Mjolnir.model.Post;
import com.Xylem.Mjolnir.model.PostType;
import com.Xylem.Mjolnir.model.PostStatus;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Query;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.WriteResult;
import com.google.api.core.ApiFuture;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Repository
public class PostRepository {
    private static final String COLLECTION_NAME = "posts";

    private final Firestore firestore;

    public PostRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    public String save(Post post) throws ExecutionException, InterruptedException {
        DocumentReference document = post.getId() == null || post.getId().isBlank()
                ? firestore.collection(COLLECTION_NAME).document()
                : firestore.collection(COLLECTION_NAME).document(post.getId());
        post.setId(document.getId());
        ApiFuture<WriteResult> future = document.set(post);
        future.get();
        return post.getId();
    }

    public Post findById(String id) throws ExecutionException, InterruptedException {
        ApiFuture<com.google.cloud.firestore.DocumentSnapshot> future = firestore.collection(COLLECTION_NAME).document(id).get();
        com.google.cloud.firestore.DocumentSnapshot document = future.get();
        if (document.exists()) {
            return document.toObject(Post.class);
        }
        return null;
    }

    public List<Post> findByUserId(String userId) throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("userId", userId)
                .orderBy("createdAt", Query.Direction.DESCENDING)
                .get();
        QuerySnapshot querySnapshot = future.get();
        List<Post> posts = new ArrayList<>();
        for (QueryDocumentSnapshot document : querySnapshot.getDocuments()) {
            posts.add(document.toObject(Post.class));
        }
        return posts;
    }

    public List<Post> findByType(PostType type) throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("type", type.name())
                .whereEqualTo("status", PostStatus.ACTIVE.name())
                .orderBy("createdAt", Query.Direction.DESCENDING)
                .get();
        QuerySnapshot querySnapshot = future.get();
        List<Post> posts = new ArrayList<>();
        for (QueryDocumentSnapshot document : querySnapshot.getDocuments()) {
            posts.add(document.toObject(Post.class));
        }
        return posts;
    }

    public List<Post> findAllActive() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("status", PostStatus.ACTIVE.name())
                .orderBy("createdAt", Query.Direction.DESCENDING)
                .get();
        QuerySnapshot querySnapshot = future.get();
        List<Post> posts = new ArrayList<>();
        for (QueryDocumentSnapshot document : querySnapshot.getDocuments()) {
            posts.add(document.toObject(Post.class));
        }
        return posts;
    }

    public void updateStatus(String id, PostStatus status) throws ExecutionException, InterruptedException {
        ApiFuture<WriteResult> future = firestore.collection(COLLECTION_NAME).document(id).update("status", status.name());
        future.get();
    }

    public ResolutionResult resolveIfActive(String id) throws ExecutionException, InterruptedException {
        DocumentReference document = firestore.collection(COLLECTION_NAME).document(id);
        return firestore.runTransaction(transaction -> {
            DocumentSnapshot snapshot = transaction.get(document).get();
            if (!snapshot.exists()) {
                return ResolutionResult.NOT_FOUND;
            }
            if (!PostStatus.ACTIVE.name().equals(snapshot.getString("status"))) {
                return ResolutionResult.ALREADY_RESOLVED;
            }
            transaction.update(document, "status", PostStatus.RESOLVED.name());
            return ResolutionResult.RESOLVED;
        }).get();
    }

    public void deleteById(String id) throws ExecutionException, InterruptedException {
        ApiFuture<WriteResult> future = firestore.collection(COLLECTION_NAME).document(id).delete();
        future.get();
    }
}
