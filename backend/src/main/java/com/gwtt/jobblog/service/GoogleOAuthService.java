package com.gwtt.jobblog.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.transaction.annotation.Transactional;
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

import io.jsonwebtoken.Claims;

import com.gwtt.jobblog.domain.RefreshToken;
import com.gwtt.jobblog.domain.Provider;
import com.gwtt.jobblog.domain.User;
import com.gwtt.jobblog.dto.GoogleTokenResponse;
import com.gwtt.jobblog.dto.GoogleUserResponse;
import com.gwtt.jobblog.exceptions.UnauthorizedException;
import com.gwtt.jobblog.repository.RefreshTokenRepository;
import com.gwtt.jobblog.repository.UserRepository;
import com.gwtt.jobblog.util.HashUtil;
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
    private final RefreshTokenRepository refreshTokenRepository;
    private final HashUtil hashUtil;

    @Transactional
    public Map<String, String> loginWithGoogle(String code) {
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

        String googleAccessToken = response.getBody().getAccessToken();

        if (googleAccessToken == null) {
            throw new RuntimeException("Failed to get access token");
        }
        
        HttpHeaders userInfoHeaders = new HttpHeaders();
        userInfoHeaders.setBearerAuth(googleAccessToken);
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

        String accessToken = jwtProvider.createAccessToken(user.getId(), user.getTokenVersion());
        String refreshToken = jwtProvider.createRefreshToken(user.getId(), user.getTokenVersion(), 1);
        String jti = jwtProvider.getJtiFromToken(refreshToken);
        String refreshHash = hashUtil.hash(refreshToken);

        RefreshToken refreshTokenEntity = RefreshToken.builder()
            .refreshHash(refreshHash)
            .userId(user.getId())
            .jti(jti)
            .expiryDate(LocalDateTime.now().plusDays(14))
            .issuedAt(LocalDateTime.now())
            .revoked(false)
            .tokenVersion(1)
            .build();   

        refreshTokenRepository.save(refreshTokenEntity);

        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshToken);

        return tokens;
    }

    @Transactional
    public Map<String, String> refreshToken(String refreshToken) {
        if (!jwtProvider.isValidRefreshToken(refreshToken)) {
            throw new UnauthorizedException("Invalid refresh token");
        }
        
        Claims claims = jwtProvider.parseRefreshToken(refreshToken);

        User user = userRepository.findById(Long.parseLong(claims.getSubject()))
                    .orElseThrow(() -> new RuntimeException("User not found"));
        
        int uver = claims.get("uver", Integer.class);
        int sver = claims.get("sver", Integer.class);
        String jti = claims.get("jti", String.class);
        
        if (user.getTokenVersion() != uver) {
            throw new UnauthorizedException("Invalid user version");
        }
        
        RefreshToken serverToken = refreshTokenRepository.findByJti(jti)
            .orElseThrow(() -> new UnauthorizedException("Refresh token not found"));
        
        if (!serverToken.getRefreshHash().equals(hashUtil.hash(refreshToken))) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        if (serverToken.isRevoked() || serverToken.isExpired()) {
            throw new UnauthorizedException("Refresh token revoked or expired");
        }

        if (serverToken.getTokenVersion() != sver) {
            throw new UnauthorizedException("Invalid session version");
        }

        serverToken.revoke();
        refreshTokenRepository.save(serverToken);

        String newAccessToken = jwtProvider.createAccessToken(user.getId(), uver);
        String newRefreshToken = jwtProvider.createRefreshToken(user.getId(), uver, sver + 1);
        String newJti = jwtProvider.getJtiFromToken(newRefreshToken);

        RefreshToken newRefreshTokenEntity = RefreshToken.builder()
            .refreshHash(hashUtil.hash(newRefreshToken))
            .userId(user.getId())
            .expiryDate(LocalDateTime.now().plusDays(14))
            .issuedAt(LocalDateTime.now())
            .revoked(false)
            .jti(newJti)
            .tokenVersion(sver + 1)
            .build();

        refreshTokenRepository.save(newRefreshTokenEntity);

        return Map.of("accessToken", newAccessToken, "refreshToken", newRefreshToken);

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

    @Transactional
    public void invalidateAllUserTokens(Long userId) {
        // 유저 정보 변경 등으로 인한 토큰 무효화
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.updateTokenVersion();
        userRepository.save(user);

        refreshTokenRepository.bulkRevokeByUserId(userId);
    }

    @Transactional
    public void logout(String refreshToken) {
        if (!jwtProvider.isValidRefreshToken(refreshToken)) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        String jti = jwtProvider.getJtiFromToken(refreshToken);
        RefreshToken refreshTokenEntity = refreshTokenRepository.findByJti(jti)
            .orElseThrow(() -> new UnauthorizedException("Refresh token not found"));
        
        refreshTokenEntity.revoke();
        refreshTokenRepository.save(refreshTokenEntity);
    }
}
