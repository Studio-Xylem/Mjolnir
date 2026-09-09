package com.Xylem.Mjolnir.security;

import com.Xylem.Mjolnir.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@ConditionalOnProperty(name = "app.auth.mode", havingValue = "local")
public class LocalAuthenticationInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String userId = request.getHeader("X-User-Id");
        if (userId == null || userId.isBlank()) {
            if ("GET".equalsIgnoreCase(request.getMethod())) {
                return true;
            }
            throw new UnauthorizedException("Provide X-User-Id for local authentication");
        }
        CurrentUser.set(new AuthenticatedUser(userId.trim(), request.getHeader("X-User-Email"),
                request.getHeader("X-User-Name")));
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
                                Exception exception) {
        CurrentUser.clear();
    }
}