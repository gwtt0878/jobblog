package com.gwtt.jobblog.dto;

import java.time.LocalDateTime;

import com.gwtt.jobblog.domain.JobPost;
import com.gwtt.jobblog.domain.JobStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class JobPostResponseDto {
    private Long id;
    private String companyName;
    private String title;
    private String description;
    private String applyUrl;
    private LocalDateTime closingDateTime;
    private JobStatus status;
    private String createdBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static JobPostResponseDto of(JobPost jobPost) {
        return JobPostResponseDto.builder()
            .id(jobPost.getId())
            .companyName(jobPost.getCompanyName())
            .title(jobPost.getTitle())
            .description(jobPost.getDescription())
            .applyUrl(jobPost.getApplyUrl())
            .closingDateTime(jobPost.getClosingDateTime())
            .status(jobPost.getStatus())
            .createdBy(jobPost.getUser().getName())
            .createdAt(jobPost.getCreatedAt())
            .updatedAt(jobPost.getUpdatedAt())
            .build();
    }
}
