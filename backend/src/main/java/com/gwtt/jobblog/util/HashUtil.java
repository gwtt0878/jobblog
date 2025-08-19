package com.gwtt.jobblog.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class HashUtil {
    @Value("${jwt.salt}")
    private String salt;

    public String hash(String refreshToken) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update((refreshToken + salt).getBytes(StandardCharsets.UTF_8));
            byte[] digest = md.digest();

            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not supported");
        }
    }
}
