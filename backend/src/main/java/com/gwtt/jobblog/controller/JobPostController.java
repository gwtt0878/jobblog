package com.gwtt.jobblog.controller;

import java.time.LocalDate;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gwtt.jobblog.annotations.LoginRequired;
import com.gwtt.jobblog.domain.User;
import com.gwtt.jobblog.dto.JobPostRequestDto;
import com.gwtt.jobblog.dto.JobPostResponseDto;
import com.gwtt.jobblog.dto.JobPostSimpleResponseDto;
import com.gwtt.jobblog.exceptions.InvalidArgumentException;
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
        Long jobPostId = jobPostService.createJobPost(jobPostRequest, user);
        return ResponseEntity.ok(jobPostId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobPostResponseDto> getJobPost(@PathVariable Long id) {
        JobPostResponseDto jobPostResponseDto = jobPostService.getJobPost(id);
        return ResponseEntity.ok(jobPostResponseDto);
    }

    @GetMapping("/my")
    @LoginRequired
    public ResponseEntity<List<JobPostSimpleResponseDto>> getMyJobPosts(@RequestAttribute("user") User user) {
        return ResponseEntity.ok(jobPostService.getJobPostsByUser(user.getId()));
    }

    @GetMapping("/search")
    @LoginRequired
    public ResponseEntity<List<JobPostSimpleResponseDto>> searchJobPosts(@RequestParam(required = false) LocalDate from, @RequestParam(required = false) LocalDate to, @RequestAttribute("user") User user) {
        if (from == null && to == null) {
            throw new InvalidArgumentException("from/to 중 하나 이상은 필수입니다.");
        }

        return ResponseEntity.ok(jobPostService.searchJobPosts(from, to, user));
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
