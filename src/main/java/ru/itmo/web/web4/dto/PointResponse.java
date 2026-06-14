package ru.itmo.web.web4.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PointResponse {
    private Long id;
    private int shot;
    private double x;
    private double y;
    private double r;
    private LocalDateTime createdAt;
}