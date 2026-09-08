package com.Xylem.Mjolnir.security;

import com.Xylem.Mjolnir.exception.UnauthorizedException;

public final class CurrentUser {
    private static final ThreadLocal<AuthenticatedUser> HOLDER = new ThreadLocal<>();

    private CurrentUser() {
    }

    static void set(AuthenticatedUser user) {
        HOLDER.set(user);
    }

    static void clear() {
        HOLDER.remove();
    }

    public static AuthenticatedUser require() {
        AuthenticatedUser user = HOLDER.get();
        if (user == null) {
            throw new UnauthorizedException("Authentication is required");
        }
        return user;
    }
}
