package com.Xylem.Mjolnir.config;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.beans.factory.annotation.Value;

@Configuration
public class WebConfiguration implements WebMvcConfigurer {
    private final List<HandlerInterceptor> authenticationInterceptors;
    private final String allowedOrigin;
    private final String storageLocation;

    public WebConfiguration(List<HandlerInterceptor> authenticationInterceptors,
                            @Value("${app.cors.allowed-origin:http://localhost:5173}") String allowedOrigin,
                            @Value("${app.storage.location:./data/uploads}") String storageLocation) {
        this.authenticationInterceptors = authenticationInterceptors;
        this.allowedOrigin = allowedOrigin;
        this.storageLocation = storageLocation;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        authenticationInterceptors.forEach(interceptor -> registry.addInterceptor(interceptor)
            .addPathPatterns("/api/**"));
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(allowedOrigin.split("\\s*,\\s*"))
                .allowedMethods("GET", "POST", "PATCH", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type")
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
            .addResourceLocations(java.nio.file.Paths.get(storageLocation).toAbsolutePath().normalize().toUri().toString());
    }
}
