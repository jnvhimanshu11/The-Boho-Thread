package com.schoolwala.dto;

import lombok.*;
import java.util.List;

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

    // ==================== Bulk Delete ====================
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BulkDeleteRequest {
        private List<String> schoolCodes; // e.g. ["SCH001", "SCH002", "SCH003"]
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BulkDeleteResponse {
        private List<String> deleted;
        private List<String> notFound;
        private int deletedCount;
        private int notFoundCount;
    }
}
