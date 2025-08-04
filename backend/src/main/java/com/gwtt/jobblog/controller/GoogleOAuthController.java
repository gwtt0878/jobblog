package com.gwtt.jobblog.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;

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

        String token = googleOAuthService.loginWithGoogle(code);

        return ResponseEntity.status(HttpStatus.FOUND)
            .header("Location", clientRedirectUri + "?token=" + token)
            .build();
    }
}
