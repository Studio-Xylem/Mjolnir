package com.Xylem.Mjolnir.config;

import com.Xylem.Mjolnir.security.FirebaseAuthenticationInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfiguration implements WebMvcConfigurer {
    private final FirebaseAuthenticationInterceptor authenticationInterceptor;
    private final String allowedOrigin;

    public WebConfiguration(FirebaseAuthenticationInterceptor authenticationInterceptor,
                            @Value("${app.cors.allowed-origin:http://localhost:5173}") String allowedOrigin) {
        this.authenticationInterceptor = authenticationInterceptor;
        this.allowedOrigin = allowedOrigin;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authenticationInterceptor)
                .addPathPatterns("/api/**");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigin)
                .allowedMethods("GET", "POST", "PATCH", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type")
                .maxAge(3600);
    }
}
