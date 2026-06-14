package ru.itmo.web.web4.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthRequest {
    @NotBlank
    private String action;

    @NotBlank
    private String login;

    @NotBlank
    private String pswd;
}