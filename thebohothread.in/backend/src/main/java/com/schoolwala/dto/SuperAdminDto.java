package com.schoolwala.dto;

import lombok.*;
import java.util.List;

public class SuperAdminDto {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class SuperAdminLoginRequest {
        private String username;
        private String password;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateSchoolRequest {
        // Core
        private String schoolCode;
        private String schoolName;
        private String affiliationNo;
        private String boardType;
        private String schoolType;
        private Integer establishedYear;
        private String websiteUrl;
        // Address
        private String state;
        private String city;
        private String locality;
        // Contact
        private String phone;
        private String email;
        private String principalName;
        private String principalContact;
        // Theme & Media
        private String primaryColor;
        private String logoBase64;
        private String bannerBase64;
        // Admin
        private String adminUsername;
        private String adminPassword;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpdateSchoolRequest {
        private String schoolName;
        private String affiliationNo;
        private String boardType;
        private String schoolType;
        private Integer establishedYear;
        private String websiteUrl;
        private String state;
        private String city;
        private String locality;
        private String phone;
        private String email;
        private String principalName;
        private String principalContact;
        private String primaryColor;
        private String logoBase64;
        private String bannerBase64;
        private String adminUsername;
        private String adminPassword;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SchoolResponse {
        private Long id;
        private String schoolCode;
        private String schoolName;
        private String affiliationNo;
        private String boardType;
        private String schoolType;
        private Integer establishedYear;
        private String websiteUrl;
        private String state;
        private String city;
        private String locality;
        private String address;
        private String phone;
        private String email;
        private String principalName;
        private String principalContact;
        private String primaryColor;
        private String adminUsername;
        private boolean hasLogo;
        private boolean hasBanner;
        private String logoBase64;
        private String createdAt;
        private String updatedAt;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BulkDeleteRequest {
        private List<String> schoolCodes;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BulkDeleteResponse {
        private List<String> deleted;
        private List<String> notFound;
        private int deletedCount;
        private int notFoundCount;
    }
}