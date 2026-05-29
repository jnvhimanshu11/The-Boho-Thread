package com.schoolwala.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SchoolLoginRequest {
        private String schoolCode;
        private String username;
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserLoginRequest {
        private String uniqueId;
        private String password;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginResponse {
        private String token;
        private String uniqueId;
        private String role;
        private String schoolCode;
        private String fullName;
        private String schoolName;
        private String logoBase64;
        private String bannerBase64;         // ← ADDED: sent at login so frontend never needs a second call
        private boolean mustChangePassword;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChangePasswordRequest {
        private String uniqueId;   // for users; null for school admin
        private String schoolCode; // for school admin; null for users
        private String role;       // SCHOOL_ADMIN | TEACHER | STUDENT
        private String currentPassword;
        private String newPassword;
    }
}