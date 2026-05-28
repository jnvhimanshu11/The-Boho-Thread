package com.schoolwala.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "schools")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class School {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Core ──────────────────────────────────────────────────────
    @Column(unique = true, nullable = false)
    private String schoolCode;

    @Column(nullable = false)
    private String schoolName;

    private String affiliationNo;
    private String boardType;       // CBSE / ICSE / STATE_BOARD / IB
    private String schoolType;      // PRIVATE / GOVERNMENT / SEMI_GOVT
    private Integer establishedYear;
    private String websiteUrl;

    // ── Address ───────────────────────────────────────────────────
    private String state;
    private String city;
    private String locality;
    private String address;         // full formatted address (auto-built)

    // ── Contact ───────────────────────────────────────────────────
    private String phone;           // office contact
    private String email;           // support email
    private String principalName;
    private String principalContact;

    // ── Theme ─────────────────────────────────────────────────────
    private String primaryColor;    // hex e.g. #4f46e5

    // ── Media ─────────────────────────────────────────────────────
    private String logoUrl;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String logoBase64;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String bannerBase64;

    // ── Admin ─────────────────────────────────────────────────────
    @Column(nullable = false)
    private String adminUsername;

    @Column(nullable = false)
    private String adminPassword;

    @Column(nullable = false)
    @Builder.Default
    private boolean mustChangePassword = true;

    // ── Timestamps ────────────────────────────────────────────────
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}