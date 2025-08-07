package com.gwtt.jobblog.dto;

import java.time.LocalDateTime;

import com.gwtt.jobblog.domain.JobStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class JobPostRequestDto {
    private String companyName;
    private String title;
    private String description;
    private String applyUrl;
    private LocalDateTime closingDateTime;
    private JobStatus status;
}
