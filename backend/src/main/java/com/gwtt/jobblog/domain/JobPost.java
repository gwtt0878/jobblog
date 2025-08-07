package com.gwtt.jobblog.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.Column;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

import com.gwtt.jobblog.dto.JobPostRequestDto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@EntityListeners(AuditingEntityListener.class)
public class JobPost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 128)
    private String companyName;

    @Column(length = 128)
    private String title;

    @Column(length = 4096)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String applyUrl;
    
    private LocalDateTime closingDateTime;

    private JobStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public void update(JobPostRequestDto jobPostRequest) {
        this.companyName = jobPostRequest.getCompanyName();
        this.title = jobPostRequest.getTitle();
        this.description = jobPostRequest.getDescription();
        this.applyUrl = jobPostRequest.getApplyUrl();
        this.closingDateTime = jobPostRequest.getClosingDateTime();
        this.status = jobPostRequest.getStatus();
    }
}
