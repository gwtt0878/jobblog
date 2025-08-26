package com.gwtt.jobblog.dto;

import lombok.Getter;
import lombok.Builder;

@Getter
@Builder
public class AttachmentConfirmDto {
    private String storageKey;
    private String originalName;
    private String contentType;
    private Long size;
}
