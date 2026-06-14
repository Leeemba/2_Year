package ru.itmo.web.web4.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PointRequest {
    @NotBlank
    private String action;

    @NotNull
    private Double x;

    @NotNull
    private Double y;

    @NotNull
    private Double r;

    @NotNull
    private Long uid;
}