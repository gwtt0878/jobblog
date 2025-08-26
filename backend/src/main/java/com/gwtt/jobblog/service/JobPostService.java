package com.gwtt.jobblog.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.gwtt.jobblog.domain.Attachment;
import com.gwtt.jobblog.domain.JobPost;
import com.gwtt.jobblog.domain.User;
import com.gwtt.jobblog.dto.JobPostRequestDto;
import com.gwtt.jobblog.dto.JobPostResponseDto;
import com.gwtt.jobblog.dto.JobPostSimpleResponseDto;
import com.gwtt.jobblog.repository.AttachmentRepository;
import com.gwtt.jobblog.repository.JobPostRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JobPostService {
    private final JobPostRepository jobPostRepository;
    private final AttachmentRepository attachmentRepository;

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

        jobPostRepository.save(jobPost);

        if (jobPostRequest.getAttachmentIds() != null && !jobPostRequest.getAttachmentIds().isEmpty()) {
            attachFiles(jobPost, jobPostRequest.getAttachmentIds(), user);
        }

        return jobPost.getId();
    }

    public JobPostResponseDto getJobPost(Long id) {
        JobPost jobPost = jobPostRepository.findWithUserById(id)
            .orElseThrow(() -> new RuntimeException("해당 공고를 찾지 못했습니다."));

        List<Attachment> attachments = attachmentRepository.findAllByJobPost_Id(id);

        return JobPostResponseDto.of(jobPost, attachments);
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

        if (jobPostRequest.getAttachmentIds() != null && !jobPostRequest.getAttachmentIds().isEmpty()) {
            replaceFiles(jobPost, jobPostRequest.getAttachmentIds(), user);
        }
    }

    public void deleteJobPost(Long id, User user) {
        JobPost jobPost = jobPostRepository.findWithUserById(id)
            .orElseThrow(() -> new RuntimeException("해당 공고를 찾지 못했습니다."));

        if (!jobPost.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("해당 공고를 삭제할 권한이 없습니다.");
        }

        detachAllFiles(jobPost, user);

        jobPostRepository.delete(jobPost);
    }

    private void attachFiles(JobPost jobPost, List<Long> attachmentIds, User user) {
        List<Attachment> attachments = attachmentRepository.findAllById(attachmentIds);

        attachments.forEach(attachment -> {
            if (!attachment.getOwner().getId().equals(user.getId())) {
                throw new RuntimeException("해당 첨부파일을 소유한 사용자가 아닙니다.");
            }
            if (attachment.getJobPost() != null) {
                throw new RuntimeException("이미 첨부된 파일입니다.");
            }

            attachment.setJobPost(jobPost);
        });

        attachmentRepository.saveAll(attachments);
    }

    private void replaceFiles(JobPost jobPost, List<Long> attachmentIds, User user) {
        detachAllFiles(jobPost, user);
        attachFiles(jobPost, attachmentIds, user);
    }

    private void detachAllFiles(JobPost jobPost, User user) {
        List<Attachment> attachments = attachmentRepository.findAllByJobPost_Id(jobPost.getId());
        attachments.forEach(attachment -> {
            if (!attachment.getOwner().getId().equals(user.getId())) {
                throw new RuntimeException("해당 첨부파일을 소유한 사용자가 아닙니다.");
            }
            attachment.setJobPost(null);
        });
        attachmentRepository.saveAll(attachments);
    }
}
