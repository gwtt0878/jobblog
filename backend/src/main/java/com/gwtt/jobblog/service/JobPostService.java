package com.gwtt.jobblog.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.gwtt.jobblog.domain.JobPost;
import com.gwtt.jobblog.domain.User;
import com.gwtt.jobblog.dto.JobPostRequestDto;
import com.gwtt.jobblog.dto.JobPostResponseDto;
import com.gwtt.jobblog.dto.JobPostSimpleResponseDto;
import com.gwtt.jobblog.repository.JobPostRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JobPostService {
    private final JobPostRepository jobPostRepository;

    public Long createJobPost(JobPostRequestDto jobPostRequest, User user) {
        JobPost jobPost = JobPost.builder()
            .companyName(jobPostRequest.getCompanyName())
            .title(jobPostRequest.getTitle())
            .description(jobPostRequest.getDescription())
            .applyUrl(jobPostRequest.getApplyUrl())
            .closingDateTime(jobPostRequest.getClosingDateTime())
            .status(jobPostRequest.getStatus())
            .user(user)
            .build();
        return jobPostRepository.save(jobPost).getId();
    }

    public JobPostResponseDto getJobPost(Long id) {
        JobPost jobPost = jobPostRepository.findWithUserById(id)
            .orElseThrow(() -> new RuntimeException("해당 공고를 찾지 못했습니다."));
        return JobPostResponseDto.of(jobPost);
    }

    public List<JobPostSimpleResponseDto> getJobPostsByUser(Long userId) {
        return jobPostRepository.findAllByUser_Id(userId).stream()
            .map(JobPostSimpleResponseDto::of)
            .collect(Collectors.toList());
    }

    public List<JobPostSimpleResponseDto> searchJobPosts(LocalDate from, LocalDate to, User user) {
        LocalDateTime startDateTime = from != null ? from.atStartOfDay() : LocalDateTime.MIN;
        LocalDateTime endDateTime = to != null ? to.atTime(LocalTime.MAX) : LocalDateTime.MAX;

        return jobPostRepository.searchOverlappingJobPosts(user.getId(), startDateTime, endDateTime).stream()
            .map(JobPostSimpleResponseDto::of)
            .collect(Collectors.toList());
    }

    public void updateJobPost(Long id, JobPostRequestDto jobPostRequest, User user) {
        JobPost jobPost = jobPostRepository.findWithUserById(id)
            .orElseThrow(() -> new RuntimeException("해당 공고를 찾지 못했습니다."));

        if (!jobPost.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("해당 공고를 수정할 권한이 없습니다.");
        }

        jobPost.update(jobPostRequest);
        jobPostRepository.save(jobPost);
    }

    public void deleteJobPost(Long id, User user) {
        JobPost jobPost = jobPostRepository.findWithUserById(id)
            .orElseThrow(() -> new RuntimeException("해당 공고를 찾지 못했습니다."));

        if (!jobPost.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("해당 공고를 삭제할 권한이 없습니다.");
        }

        jobPostRepository.delete(jobPost);
    }
}
