package com.gwtt.jobblog.exceptions;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ErrorResponse {
    private int status;
    private String code;
    private String message;
    private LocalDateTime timestamp;
}
