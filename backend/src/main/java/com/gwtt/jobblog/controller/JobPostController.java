package com.gwtt.jobblog.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RestController;

import com.gwtt.jobblog.annotations.LoginRequired;
import com.gwtt.jobblog.domain.User;
import com.gwtt.jobblog.dto.JobPostRequestDto;
import com.gwtt.jobblog.dto.JobPostResponseDto;
import com.gwtt.jobblog.dto.JobPostSimpleResponseDto;
import com.gwtt.jobblog.service.JobPostService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/job-posts")
@RequiredArgsConstructor
public class JobPostController {

    private final JobPostService jobPostService;

    @PostMapping
    @LoginRequired
    public ResponseEntity<Long> createJobPost(@RequestBody JobPostRequestDto jobPostRequest, @RequestAttribute("user") User user) {
        return ResponseEntity.ok(jobPostService.createJobPost(jobPostRequest, user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobPostResponseDto> getJobPost(@PathVariable Long id) {
        return ResponseEntity.ok(jobPostService.getJobPost(id));
    }

    @GetMapping("/my")
    @LoginRequired
    public ResponseEntity<List<JobPostSimpleResponseDto>> getMyJobPosts(@RequestAttribute("user") User user) {
        return ResponseEntity.ok(jobPostService.getJobPostsByUser(user.getId()));
    }

    @PutMapping("/{id}")
    @LoginRequired
    public ResponseEntity<Void> updateJobPost(@PathVariable Long id, @RequestBody JobPostRequestDto jobPostRequest, @RequestAttribute("user") User user) {
        jobPostService.updateJobPost(id, jobPostRequest, user);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @LoginRequired
    public ResponseEntity<Void> deleteJobPost(@PathVariable Long id, @RequestAttribute("user") User user) {
        jobPostService.deleteJobPost(id, user);
        return ResponseEntity.noContent().build();
    }
}
