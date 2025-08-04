package com.gwtt.jobblog.service;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.gwtt.jobblog.domain.Provider;
import com.gwtt.jobblog.domain.User;
import com.gwtt.jobblog.dto.GoogleTokenResponse;
import com.gwtt.jobblog.dto.GoogleUserResponse;
import com.gwtt.jobblog.repository.UserRepository;
import com.gwtt.jobblog.util.JwtProvider;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GoogleOAuthService {
    @Value("${google.client-id}")
    private String clientId;
    @Value("${google.client-secret}")
    private String clientSecret;
    @Value("${google.redirect-uri}")
    private String redirectUri;

    private final RestTemplate restTemplate = new RestTemplate();
    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;

    public String loginWithGoogle(String code) {
        String tokenUrl = "https://oauth2.googleapis.com/token";

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("grant_type", "authorization_code");
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(params, headers);
        ResponseEntity<GoogleTokenResponse> response = restTemplate.postForEntity(tokenUrl, requestEntity, GoogleTokenResponse.class);
        
        if (response.getStatusCode() != HttpStatus.OK) {
            throw new RuntimeException("Failed to get access token");
        }

        String accessToken = response.getBody().getAccessToken();

        if (accessToken == null) {
            throw new RuntimeException("Failed to get access token");
        }
        
        HttpHeaders userInfoHeaders = new HttpHeaders();
        userInfoHeaders.setBearerAuth(accessToken);
        userInfoHeaders.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> userInfoRequest = new HttpEntity<>(userInfoHeaders);
        ResponseEntity<GoogleUserResponse> userInfoResponse = restTemplate.exchange(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            HttpMethod.GET,
            userInfoRequest,
            GoogleUserResponse.class
        );

        User user = userRepository.findByProviderAndProviderId(Provider.GOOGLE, userInfoResponse.getBody().getId())
                    .orElseGet(()->registerUser(userInfoResponse.getBody()));

        String token = jwtProvider.createToken(user.getProviderId(), user.getEmail(), user.getName());
    
        return token;
    }

    private User registerUser(GoogleUserResponse userInfo) {
        User user = User.builder()
            .email(userInfo.getEmail())
            .name(userInfo.getName())
            .provider(Provider.GOOGLE)
            .providerId(userInfo.getId())
            .build();
        return userRepository.save(user);
    }
}
