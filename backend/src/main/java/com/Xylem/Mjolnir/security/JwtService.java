package com.Xylem.Mjolnir.security;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
    private final byte[] secret;
    private final Duration lifetime;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.lifetime:PT2H}") Duration lifetime) {
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException("app.jwt.secret must be at least 32 bytes");
        }
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.lifetime = lifetime;
    }

    public String createToken(String userId, String username) {
        Instant now = Instant.now();
        return Jwts.builder().subject(userId).claim("username", username)
                .issuedAt(Date.from(now)).expiration(Date.from(now.plus(lifetime)))
                .signWith(Keys.hmacShaKeyFor(secret)).compact();
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(Keys.hmacShaKeyFor(secret)).build()
                .parseSignedClaims(token).getPayload();
    }
}
