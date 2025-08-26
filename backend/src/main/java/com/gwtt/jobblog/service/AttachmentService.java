package com.gwtt.jobblog.service;

import org.springframework.stereotype.Service;  
import com.amazonaws.services.s3.AmazonS3;
import org.springframework.beans.factory.annotation.Value;
import java.time.Instant;
import java.time.Duration;
import java.util.Date;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
import com.amazonaws.HttpMethod;

import lombok.RequiredArgsConstructor;
import com.gwtt.jobblog.repository.AttachmentRepository;
import com.gwtt.jobblog.domain.Attachment;
import com.gwtt.jobblog.dto.AttachmentConfirmDto;
import com.gwtt.jobblog.dto.AttachmentResponseDto;
import com.gwtt.jobblog.domain.User;

@Service    
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttachmentService {
    private final Duration EXPIRATION_TIME = Duration.ofMinutes(10);

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    private final AmazonS3 s3Client;
    private final AttachmentRepository attachmentRepository;

    public String getPresignedUrl(String fileName, String contentType) {
        String storageKey = generateStorageKey(fileName);

        GeneratePresignedUrlRequest generatePresignedUrlRequest = new GeneratePresignedUrlRequest(bucketName, storageKey)
            .withMethod(HttpMethod.PUT)
            .withExpiration(Date.from(Instant.now().plus(EXPIRATION_TIME)))
            .withContentType(contentType);

        return s3Client.generatePresignedUrl(generatePresignedUrlRequest).toString();
    }

    public String getStorageKey(String fileName) {
        return generateStorageKey(fileName);
    }

    @Transactional
    public AttachmentResponseDto confirm(AttachmentConfirmDto attachmentConfirmDto, User user) {
        Attachment attachment = Attachment.builder()
            .storageKey(attachmentConfirmDto.getStorageKey())
            .originalName(attachmentConfirmDto.getOriginalName())
            .contentType(attachmentConfirmDto.getContentType())
            .size(attachmentConfirmDto.getSize())
            .owner(user)
            .build();

        attachmentRepository.save(attachment);

        return AttachmentResponseDto.from(attachment);
    }

    public String getDownloadUrl(Long id, User user) {
        Attachment attachment = attachmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("해당 첨부파일을 찾지 못했습니다."));
        return s3Client.generatePresignedUrl(bucketName, attachment.getStorageKey(), new Date(System.currentTimeMillis() + EXPIRATION_TIME.toMillis())).toString();
    }

    @Transactional
    public void deleteAttachment(Long id, User user) {
        Attachment attachment = attachmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("해당 첨부파일을 찾지 못했습니다."));

        if (!attachment.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("해당 첨부파일을 소유한 사용자가 아닙니다.");
        }

        attachmentRepository.delete(attachment);
    }

    private String generateStorageKey(String fileName) {
        String extension = fileName.substring(fileName.lastIndexOf(".") + 1);
        return String.format("%s/%s.%s", 
          LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd")),
          UUID.randomUUID().toString(),
          extension);
    }
}
