package com.gwtt.jobblog.controller;

import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;

import com.gwtt.jobblog.annotations.LoginRequired;
import com.gwtt.jobblog.service.GoogleOAuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/oauth")
@RequiredArgsConstructor
public class GoogleOAuthController {

    private final GoogleOAuthService googleOAuthService;

    

    @Value("${client.redirect-uri}")
    private String clientRedirectUri;

    @GetMapping("/google/callback")
    public ResponseEntity<Map<String, String>> googleCallback(@RequestParam String code) {

        Map<String, String> tokens = googleOAuthService.loginWithGoogle(code);

        return ResponseEntity.status(HttpStatus.FOUND)
            .header(HttpHeaders.LOCATION, clientRedirectUri + "?token=" + tokens.get("accessToken"))
            .header(HttpHeaders.SET_COOKIE, "refreshToken=" + tokens.get("refreshToken") + "; HttpOnly;"
            // + "Secure;"
            + "SameSite=Lax;" 
            + "Max-Age=1209600;"
            + "Path=/")
            .build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<String> refreshToken(@CookieValue(name = "refreshToken", required = false) String refreshToken) {
        if (refreshToken == null) {
           return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token required");
        }

        Map<String, String> tokens = googleOAuthService.refreshToken(refreshToken);

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, "refreshToken=" + tokens.get("refreshToken") + "; HttpOnly;"
            // + "Secure;"
            + "SameSite=Lax;" 
            + "Max-Age=1209600;"
            + "Path=/")
            .body(tokens.get("accessToken"));
    }

    @PostMapping("/logout")
    @LoginRequired
    public ResponseEntity<Void> logout(@CookieValue(name = "refreshToken") String refreshToken) {
        googleOAuthService.logout(refreshToken);
        return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, "refreshToken=; HttpOnly;"
            // + "Secure;"
            + "SameSite=Lax;" 
            + "Max-Age=0;"
            + "Path=/")
            .build();
    }
}
