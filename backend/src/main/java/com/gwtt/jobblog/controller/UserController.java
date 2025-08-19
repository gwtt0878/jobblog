package com.gwtt.jobblog.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.http.ResponseEntity;

import com.gwtt.jobblog.domain.User;
import com.gwtt.jobblog.annotations.LoginRequired;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    // private final UserService userService;

    @GetMapping("/me")
    @LoginRequired
    public ResponseEntity<String> getMyName(@RequestAttribute("user") User user) {
        return ResponseEntity.ok(user.getName());
    }
}
