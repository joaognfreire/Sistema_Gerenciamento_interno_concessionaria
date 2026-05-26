package com.concessionaria.security;

import java.util.Optional;

public final class CurrentUser {
    private static final ThreadLocal<AuthenticatedUser> HOLDER = new ThreadLocal<>();

    private CurrentUser() {
    }

    public static void set(AuthenticatedUser user) {
        HOLDER.set(user);
    }

    public static Optional<AuthenticatedUser> get() {
        return Optional.ofNullable(HOLDER.get());
    }

    public static void clear() {
        HOLDER.remove();
    }
}
