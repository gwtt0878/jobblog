package com.gwtt.jobblog.dto;

import lombok.Getter;
import lombok.Builder;

@Getter
@Builder
public class GoogleUserResponseDto {
    private String id;
    private String email;
    private String name;
}
