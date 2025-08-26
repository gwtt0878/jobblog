package com.gwtt.jobblog.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.gwtt.jobblog.domain.Attachment;
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

    private List<AttachmentResponseDto> attachments;

    public void setAttachments(List<AttachmentResponseDto> attachments) {
        this.attachments = attachments;
    }

    public static JobPostResponseDto of(JobPost jobPost, List<Attachment> attachments) {
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
            .attachments(attachments.stream()
                .map(AttachmentResponseDto::from)
                .collect(Collectors.toList()))
            .build();
    }
}
