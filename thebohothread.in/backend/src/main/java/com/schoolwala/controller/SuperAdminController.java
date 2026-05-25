package com.schoolwala.controller;

import com.schoolwala.dto.SuperAdminDto;
import com.schoolwala.service.SuperAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/super-admin/schools")
@RequiredArgsConstructor
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    @PostMapping
    public ResponseEntity<?> createSchool(@RequestBody SuperAdminDto.CreateSchoolRequest req) {
        try {
            return ResponseEntity.ok(superAdminService.createSchool(req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllSchools() {
        return ResponseEntity.ok(superAdminService.getAllSchools());
    }

    @GetMapping("/{schoolCode}")
    public ResponseEntity<?> getSchool(@PathVariable String schoolCode) {
        try {
            return ResponseEntity.ok(superAdminService.getSchool(schoolCode));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{schoolCode}")
    public ResponseEntity<?> updateSchool(@PathVariable String schoolCode,
                                          @RequestBody SuperAdminDto.UpdateSchoolRequest req) {
        try {
            return ResponseEntity.ok(superAdminService.updateSchool(schoolCode, req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{schoolCode}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable String schoolCode,
                                           @RequestBody Map<String, String> body) {
        try {
            String newPassword = body.get("newPassword");
            if (newPassword == null || newPassword.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "newPassword is required"));
            }
            superAdminService.resetPassword(schoolCode, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{schoolCode}")
    public ResponseEntity<?> deleteSchool(@PathVariable String schoolCode) {
        try {
            superAdminService.deleteSchool(schoolCode);
            return ResponseEntity.ok(Map.of("message", "School deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
