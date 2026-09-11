package com.Xylem.Mjolnir.security;

import com.Xylem.Mjolnir.exception.UnauthorizedException;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Component
@ConditionalOnProperty(name = "app.auth.mode", havingValue = "firebase", matchIfMissing = true)
public class FirebaseAuthenticationInterceptor implements HandlerInterceptor {
    private final FirebaseAuth firebaseAuth;

    public FirebaseAuthenticationInterceptor(FirebaseAuth firebaseAuth) {
        this.firebaseAuth = firebaseAuth;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            if ("GET".equalsIgnoreCase(request.getMethod()) && isPublicRead(request.getRequestURI())) {
                return true;
            }
            throw new UnauthorizedException("Provide a Firebase ID token as a Bearer token");
        }

        try {
            FirebaseToken token = firebaseAuth.verifyIdToken(authorization.substring(7));
            CurrentUser.set(new AuthenticatedUser(token.getUid(), token.getEmail(), token.getName()));
            return true;
        } catch (FirebaseAuthException exception) {
            throw new UnauthorizedException("The Firebase ID token is invalid or expired");
        }
    }

    private boolean isPublicRead(String requestUri) {
        return "/api/posts".equals(requestUri)
                || "/api/posts/public".equals(requestUri)
            || (requestUri.matches("/api/posts/[^/]+$") && !"/api/posts/mine".equals(requestUri));
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
                                Exception exception) {
        CurrentUser.clear();
    }
}
