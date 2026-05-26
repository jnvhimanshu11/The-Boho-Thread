package com.schoolwala.controller;

import com.schoolwala.dto.AuthDto;
import com.schoolwala.security.JwtAuthFilter;
import com.schoolwala.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/teacher/login")
    public ResponseEntity<?> teacherLogin(@RequestBody AuthDto.UserLoginRequest req) {
        try {
            return ResponseEntity.ok(authService.teacherLogin(req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/student/login")
    public ResponseEntity<?> studentLogin(@RequestBody AuthDto.UserLoginRequest req) {
        try {
            return ResponseEntity.ok(authService.studentLogin(req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Change password for teacher or student (uses uniqueId from JWT) */
    @PostMapping("/change-password/user")
    public ResponseEntity<?> changePasswordUser(@RequestBody AuthDto.ChangePasswordRequest req,
                                                Authentication auth) {
        try {
            String uniqueId = (String) auth.getPrincipal();
            authService.changePasswordForUser(uniqueId, req);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Change password for school admin (uses schoolCode from JWT) */
    @PostMapping("/change-password/school")
    public ResponseEntity<?> changePasswordSchool(@RequestBody AuthDto.ChangePasswordRequest req,
                                                  Authentication auth) {
        try {
            String schoolCode = ((JwtAuthFilter.JwtDetails) auth.getDetails()).schoolCode();
            authService.changePasswordForSchool(schoolCode, req);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/ping")
    public ResponseEntity<?> ping() {
        return ResponseEntity.ok(Map.of("status", "SchoolWala API is running"));
    }
}
