package com.schoolwala.controller;

import com.schoolwala.dto.AuthDto;
import com.schoolwala.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    /**
     * First-time / forced password change.
     * Accessible without extra role guard — the JWT is already valid from login.
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody AuthDto.ChangePasswordRequest req) {
        try {
            authService.changePassword(req);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * School Admin resets a teacher's or student's password.
     * Body: { "newPassword": "..." }
     */
    @PostMapping("/reset-password/{uniqueId}")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public ResponseEntity<?> resetUserPassword(@PathVariable String uniqueId,
                                               @RequestBody Map<String, String> body) {
        try {
            String newPassword = body.get("newPassword");
            if (newPassword == null || newPassword.length() < 6) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
            }
            authService.resetUserPassword(uniqueId, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password reset successfully. User must change it on next login."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/ping")
    public ResponseEntity<?> ping() {
        return ResponseEntity.ok(Map.of("status", "SchoolWala API is running"));
    }
}