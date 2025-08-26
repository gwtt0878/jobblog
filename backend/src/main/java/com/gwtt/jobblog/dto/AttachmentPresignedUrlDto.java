package com.gwtt.jobblog.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AttachmentPresignedUrlDto {
    private String fileName;
    private String contentType;
}
