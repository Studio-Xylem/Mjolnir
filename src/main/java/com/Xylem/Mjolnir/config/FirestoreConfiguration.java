package com.Xylem.Mjolnir.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FirestoreOptions;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FirestoreConfiguration {
    @Bean(destroyMethod = "close")
    Firestore firestore(@Value("${firebase.project-id:mjolnir-local}") String projectId) throws IOException {
        FirestoreOptions.Builder options = FirestoreOptions.newBuilder().setProjectId(projectId);
        String emulatorHost = System.getenv("FIRESTORE_EMULATOR_HOST");
        if (emulatorHost != null && !emulatorHost.isBlank()) {
            options.setEmulatorHost(emulatorHost);
        } else {
            options.setCredentials(GoogleCredentials.getApplicationDefault());
        }
        return options.build().getService();
    }
}