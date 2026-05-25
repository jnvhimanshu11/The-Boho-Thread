package com.schoolwala.dto;

import lombok.*;

public class SuperAdminDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SuperAdminLoginRequest {
        private String username;
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateSchoolRequest {
        private String schoolCode;
        private String schoolName;
        private String address;
        private String phone;
        private String email;
        private String adminUsername;
        private String adminPassword;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateSchoolRequest {
        private String schoolName;
        private String address;
        private String phone;
        private String email;
        private String adminUsername;
        private String adminPassword;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SchoolResponse {
        private Long id;
        private String schoolCode;
        private String schoolName;
        private String address;
        private String phone;
        private String email;
        private String adminUsername;
        private boolean hasLogo;
        private String createdAt;
        private String updatedAt;
    }
}
