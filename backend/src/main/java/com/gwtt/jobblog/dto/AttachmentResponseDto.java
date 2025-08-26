package com.gwtt.jobblog.dto;

import com.gwtt.jobblog.domain.Attachment;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AttachmentResponseDto {
    private Long id;
    private String originalName;
    private String contentType;
    private Long size;

    public static AttachmentResponseDto from(Attachment attachment) {
        return AttachmentResponseDto.builder()
            .id(attachment.getId())
            .originalName(attachment.getOriginalName())
            .contentType(attachment.getContentType())
            .size(attachment.getSize())
            .build();
    }
}
