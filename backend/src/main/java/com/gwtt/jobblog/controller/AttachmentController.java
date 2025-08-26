package com.gwtt.jobblog.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.http.ResponseEntity;
import lombok.RequiredArgsConstructor;
import java.util.Map;
import com.gwtt.jobblog.dto.AttachmentConfirmDto;
import com.gwtt.jobblog.dto.AttachmentResponseDto;
import com.gwtt.jobblog.dto.AttachmentPresignedUrlDto;
import com.gwtt.jobblog.service.AttachmentService;
import com.gwtt.jobblog.domain.User;
import org.springframework.web.bind.annotation.RequestAttribute;
import com.gwtt.jobblog.annotations.LoginRequired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;

@RestController
@RequestMapping("/attachments")
@RequiredArgsConstructor
public class AttachmentController {
    private final AttachmentService attachmentService;

    @PostMapping("/presigned-url")
    @LoginRequired
    public ResponseEntity<Map<String, String>> getPresignedUrl(@RequestBody AttachmentPresignedUrlDto attachmentPresignedUrlDto) {

        String presignedUrl = attachmentService.getPresignedUrl(attachmentPresignedUrlDto.getFileName(), attachmentPresignedUrlDto.getContentType());
        String storageKey = attachmentService.getStorageKey(attachmentPresignedUrlDto.getFileName());

        Map<String, String> response = Map.of("presignedUrl", presignedUrl, "storageKey", storageKey);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/confirm")
    @LoginRequired
    public ResponseEntity<AttachmentResponseDto> confirm(@RequestBody AttachmentConfirmDto attachmentConfirmDto, @RequestAttribute("user") User user) {
        AttachmentResponseDto attachmentResponseDto = attachmentService.confirm(attachmentConfirmDto, user);
        return ResponseEntity.ok(attachmentResponseDto);
    }

    @GetMapping("/{id}/download-url")
    @LoginRequired
    public ResponseEntity<String> getDownloadUrl(@PathVariable Long id, @RequestAttribute("user") User user) {
        String downloadUrl = attachmentService.getDownloadUrl(id, user);
        return ResponseEntity.ok(downloadUrl);
    }

    @DeleteMapping("/{id}")
    @LoginRequired
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long id, @RequestAttribute("user") User user) {
        attachmentService.deleteAttachment(id, user);
        return ResponseEntity.noContent().build();
    }
}
