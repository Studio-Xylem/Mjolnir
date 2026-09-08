package com.Xylem.Mjolnir.config;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfiguration implements WebMvcConfigurer {
    private final List<HandlerInterceptor> authenticationInterceptors;
    private final String allowedOrigin;

    public WebConfiguration(List<HandlerInterceptor> authenticationInterceptors,
                            @Value("${app.cors.allowed-origin:http://localhost:5173}") String allowedOrigin) {
        this.authenticationInterceptors = authenticationInterceptors;
        this.allowedOrigin = allowedOrigin;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        authenticationInterceptors.forEach(interceptor -> registry.addInterceptor(interceptor)
            .addPathPatterns("/api/**"));
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigin)
                .allowedMethods("GET", "POST", "PATCH", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type", "X-User-Id", "X-User-Email", "X-User-Name")
                .maxAge(3600);
    }
}
