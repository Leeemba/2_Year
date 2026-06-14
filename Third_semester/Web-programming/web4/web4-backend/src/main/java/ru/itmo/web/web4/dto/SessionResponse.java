package ru.itmo.web.web4.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.itmo.web.web4.model.Users;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SessionResponse {
    private boolean authenticated;
    private String token;
    private Users user;
}