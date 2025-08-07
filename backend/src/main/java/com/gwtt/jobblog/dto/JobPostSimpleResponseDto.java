package com.gwtt.jobblog.dto;

import java.time.LocalDateTime;

import com.gwtt.jobblog.domain.JobPost;
import com.gwtt.jobblog.domain.JobStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class JobPostSimpleResponseDto {
    private Long id;

    private String companyName;
    private String title;
    private JobStatus status;
    private LocalDateTime closingDateTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static JobPostSimpleResponseDto of(JobPost jobPost) {
        return JobPostSimpleResponseDto.builder()
            .id(jobPost.getId())
            .companyName(jobPost.getCompanyName())
            .title(jobPost.getTitle())
            .status(jobPost.getStatus())
            .closingDateTime(jobPost.getClosingDateTime())
            .createdAt(jobPost.getCreatedAt())
            .updatedAt(jobPost.getUpdatedAt())
            .build();
    }   
}
