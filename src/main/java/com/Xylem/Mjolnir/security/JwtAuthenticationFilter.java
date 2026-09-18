package com.Xylem.Mjolnir.security;

import java.io.IOException;

import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.Xylem.Mjolnir.exception.UnauthorizedException;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith("Bearer ")) {
            try {
                Claims claims = jwtService.parse(header.substring(7));
                CurrentUser.set(new AuthenticatedUser(claims.getSubject(), null,
                        claims.get("username", String.class)));
                SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken(claims.getSubject(), null, java.util.List.of()));
            } catch (Exception exception) {
                throw new UnauthorizedException("The JWT is invalid or expired");
            }
        }
        try {
            filterChain.doFilter(request, response);
        } finally {
            CurrentUser.clear();
            SecurityContextHolder.clearContext();
        }
    }
}
