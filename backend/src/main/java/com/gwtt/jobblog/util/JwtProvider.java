package com.gwtt.jobblog.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtProvider {

    @Value("${jwt.issuer}")
    private String issuer;

    @Value("${jwt.secret-key}")
    private String secretKey;

    @Value("${jwt.secret-refresh-key}")
    private String secretRefreshKey;

    private final long ACCESS_TOKEN_EXPIRATION = 1000 * 60 * 30; 

    private final long REFRESH_TOKEN_EXPIRATION = 1000 * 60 * 60 * 24 * 14;

    private SecretKey getSigningKey() {
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private SecretKey getRefreshSigningKey() {
        byte[] keyBytes = secretRefreshKey.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String createAccessToken(Long userId, int userVersion) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + ACCESS_TOKEN_EXPIRATION);

        return Jwts.builder()
            .issuer(issuer)
            .subject(String.valueOf(userId))
            .claim("token_type", "access")
            .claim("uver", userVersion) // user version
            .issuedAt(now)
            .expiration(expiration)
            .signWith(getSigningKey())
            .compact();
    }

    public String createRefreshToken(Long userId, int userVersion, int tokenVersion) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + REFRESH_TOKEN_EXPIRATION);
        String jti = UUID.randomUUID().toString();

        return Jwts.builder()
            .issuer(issuer)
            .subject(String.valueOf(userId))
            .claim("token_type", "refresh")
            .claim("jti", jti)
            .claim("uver", userVersion) // user version
            .claim("sver", tokenVersion) // session version
            .issuedAt(now)
            .expiration(expiration)
            .signWith(getRefreshSigningKey())
            .compact();
    }

    public String getUserIdFromToken(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .getSubject();
    }

    public Claims parseRefreshToken(String token) {
        return Jwts.parser()
            .verifyWith(getRefreshSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public String getJtiFromToken(String token) {
        return Jwts.parser()
            .verifyWith(getRefreshSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .get("jti", String.class);
    }

    public boolean isValidAccessToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isValidRefreshToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(getRefreshSigningKey())
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
