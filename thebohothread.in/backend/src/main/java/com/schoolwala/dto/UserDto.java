package com.schoolwala.dto;

import com.schoolwala.entity.Role;
import lombok.*;
import java.time.LocalDate;

public class UserDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateTeacherRequest {
        private String employeeId;
        private String fullName;
        private String email;
        private String phone;
        private String address;
        private LocalDate dateOfBirth;
        private String subject;
        private String classAssigned;
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateTeacherRequest {
        private String employeeId;
        private String fullName;
        private String email;
        private String phone;
        private String address;
        private LocalDate dateOfBirth;
        private String subject;
        private String classAssigned;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateStudentRequest {
        private String fullName;
        private String email;
        private String phone;
        private String address;
        private LocalDate dateOfBirth;
        private String grade;
        private String section;
        private String parentName;
        private String parentPhone;
        private String password;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserResponse {
        private Long id;
        private String uniqueId;
        private String employeeId;
        private String username;
        private String fullName;
        private String email;
        private String phone;
        private LocalDate dateOfBirth;
        private String address;
        private String role;
        private String schoolCode;
        private String subject;
        private String classAssigned;
        private String grade;
        private String section;
        private String parentName;
        private String parentPhone;
        private boolean active;
        private boolean mustChangePassword;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateLogoRequest {
        private String logoBase64; // data:image/png;base64,...
    }

    // ── NEW: used by PUT /school/admin/banner ─────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateBannerRequest {
        private String bannerBase64; // data:image/jpeg;base64,...
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResetPasswordRequest {
        private String newPassword;
    }
}