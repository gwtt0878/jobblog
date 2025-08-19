package com.gwtt.jobblog.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import com.gwtt.jobblog.annotations.LoginRequired;
import com.gwtt.jobblog.domain.User;
import com.gwtt.jobblog.repository.UserRepository;  
import com.gwtt.jobblog.util.JwtProvider;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthInterceptor implements HandlerInterceptor {
    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        boolean isLoginRequired = handlerMethod.getMethod().isAnnotationPresent(LoginRequired.class)
            || handlerMethod.getBeanType().isAnnotationPresent(LoginRequired.class);

        if (!isLoginRequired) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "로그인이 필요합니다.");
            return false;
        }

        String token = authHeader.substring(7);

        if (!jwtProvider.isValidAccessToken(token)) {
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "로그인이 필요합니다.");
            return false;
        }

        Long userId = Long.parseLong(jwtProvider.getUserIdFromToken(token));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        request.setAttribute("user", user);
        return true;
    }
}
