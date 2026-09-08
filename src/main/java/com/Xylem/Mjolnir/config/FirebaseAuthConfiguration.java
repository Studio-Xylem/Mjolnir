package com.Xylem.Mjolnir.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "app.auth.mode", havingValue = "firebase", matchIfMissing = true)
public class FirebaseAuthConfiguration {
    @Bean FirebaseApp firebaseApp(@Value("${firebase.project-id:}") String projectId) throws IOException {
        FirebaseOptions.Builder options = FirebaseOptions.builder().setCredentials(GoogleCredentials.getApplicationDefault());
        if (!projectId.isBlank()) options.setProjectId(projectId);
        return FirebaseApp.getApps().isEmpty() ? FirebaseApp.initializeApp(options.build()) : FirebaseApp.getInstance();
    }
    @Bean FirebaseAuth firebaseAuth(FirebaseApp firebaseApp) { return FirebaseAuth.getInstance(firebaseApp); }
}
