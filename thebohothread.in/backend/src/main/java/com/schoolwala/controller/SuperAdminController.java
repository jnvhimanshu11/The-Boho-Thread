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

    // ── Create school ─────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<?> createSchool(@RequestBody SuperAdminDto.CreateSchoolRequest req) {
        try {
            return ResponseEntity.ok(superAdminService.createSchool(req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Get all schools ───────────────────────────────────────────
    @GetMapping
    public ResponseEntity<?> getAllSchools() {
        return ResponseEntity.ok(superAdminService.getAllSchools());
    }

    // ── Get single school ─────────────────────────────────────────
    @GetMapping("/{schoolCode}")
    public ResponseEntity<?> getSchool(@PathVariable String schoolCode) {
        try {
            return ResponseEntity.ok(superAdminService.getSchool(schoolCode));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Update school ─────────────────────────────────────────────
    @PutMapping("/{schoolCode}")
    public ResponseEntity<?> updateSchool(@PathVariable String schoolCode,
                                          @RequestBody SuperAdminDto.UpdateSchoolRequest req) {
        try {
            return ResponseEntity.ok(superAdminService.updateSchool(schoolCode, req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Reset password ────────────────────────────────────────────
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

    // ── Delete single ─────────────────────────────────────────────
    @DeleteMapping("/{schoolCode}")
    public ResponseEntity<?> deleteSchool(@PathVariable String schoolCode) {
        try {
            superAdminService.deleteSchool(schoolCode);
            return ResponseEntity.ok(Map.of("message", "School deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Delete bulk ───────────────────────────────────────────────
    // DELETE /api/super-admin/schools/bulk
    // Body: { "schoolCodes": ["SCH001", "SCH002", "SCH003"] }
    @DeleteMapping("/bulk")
    public ResponseEntity<?> deleteSchoolsBulk(@RequestBody SuperAdminDto.BulkDeleteRequest req) {
        try {
            if (req.getSchoolCodes() == null || req.getSchoolCodes().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "schoolCodes list is required"));
            }
            return ResponseEntity.ok(superAdminService.deleteSchoolsBulk(req.getSchoolCodes()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
