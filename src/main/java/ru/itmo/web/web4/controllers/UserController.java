package ru.itmo.web.web4.controllers;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.itmo.web.web4.dto.AuthRequest;
import ru.itmo.web.web4.dto.AuthResponse;
import ru.itmo.web.web4.dto.SessionResponse;
import ru.itmo.web.web4.model.Users;
import ru.itmo.web.web4.service.JwtService;
import ru.itmo.web.web4.service.UserService;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest credentials,
                                              HttpServletResponse response) {
        Users user = userService.authenticate(credentials.getLogin(), credentials.getPswd());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(null, null, "Invalid credentials"));
        }

        String token = jwtService.generateToken(user.getUsername());
        user.setPassword(null);

        // Устанавливаем HttpOnly cookie (опционально)
        Cookie authCookie = new Cookie("auth_token", token);
        authCookie.setHttpOnly(true);
        authCookie.setSecure(false); // В development false, в production true
        authCookie.setPath("/");
        authCookie.setMaxAge(24 * 60 * 60); // 24 часа
        response.addCookie(authCookie);

        return ResponseEntity.ok(new AuthResponse(token, user, "Login successful"));
    }
    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(@AuthenticationPrincipal Users user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok().build();
    }
    @GetMapping("/session")
    public ResponseEntity<SessionResponse> getSession(@AuthenticationPrincipal Users user,
                                                      HttpServletRequest request) {
        // Проверяем токен из cookie
        String token = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("auth_token".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        // Если нет токена в cookie или токен невалиден
        if (token == null || !jwtService.isTokenValid(token)) {
            return ResponseEntity.ok(new SessionResponse(false, null, null));
        }

        if (user == null) {
            return ResponseEntity.ok(new SessionResponse(false, null, null));
        }

        // Не генерируем новый токен, возвращаем существующий
        user.setPassword(null);
        return ResponseEntity.ok(new SessionResponse(true, token, user));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest credentials,
                                                 HttpServletResponse response) {
        try {
            Users user = userService.register(credentials.getLogin(), credentials.getPswd());
            String token = jwtService.generateToken(user.getUsername());
            user.setPassword(null);

            // Устанавливаем HttpOnly cookie
            Cookie authCookie = new Cookie("auth_token", token);
            authCookie.setHttpOnly(true);
            authCookie.setSecure(false);
            authCookie.setPath("/");
            authCookie.setMaxAge(24 * 60 * 60);
            response.addCookie(authCookie);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new AuthResponse(token, user, "Registration successful"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new AuthResponse(null, null, e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(HttpServletResponse response,
                                               @AuthenticationPrincipal Users user,
                                               HttpServletRequest request) {

        // Получаем токен для инвалидации
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("auth_token".equals(cookie.getName())) {
                    jwtService.invalidateToken(cookie.getValue());
                    break;
                }
            }
        }

        // Удаляем cookie
        Cookie authCookie = new Cookie("auth_token", null);
        authCookie.setHttpOnly(true);
        authCookie.setSecure(false);
        authCookie.setPath("/");
        authCookie.setMaxAge(0);
        response.addCookie(authCookie);

        return ResponseEntity.ok(new AuthResponse(null, null, "Logged out successfully"));
    }
}