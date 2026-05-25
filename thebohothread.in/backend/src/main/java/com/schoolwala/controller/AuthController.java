package com.schoolwala.controller;

import com.schoolwala.dto.AuthDto;
import com.schoolwala.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/school/login")
    public ResponseEntity<?> schoolLogin(@RequestBody AuthDto.SchoolLoginRequest req) {
        try {
            return ResponseEntity.ok(authService.schoolLogin(req));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/teacher/login")
    public ResponseEntity<?> teacherLogin(@RequestBody AuthDto.UserLoginRequest req) {
        try {
            return ResponseEntity.ok(authService.teacherLogin(req));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/student/login")
    public ResponseEntity<?> studentLogin(@RequestBody AuthDto.UserLoginRequest req) {
        try {
            return ResponseEntity.ok(authService.studentLogin(req));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/ping")
    public ResponseEntity<?> ping() {
        return ResponseEntity.ok(Map.of("status", "SchoolWala API is running"));
    }
}
