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

    @Column(unique = true, nullable = false)
    private String schoolCode;

    @Column(nullable = false)
    private String schoolName;

    private String address;
    private String phone;
    private String email;
    private String logoUrl;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String logoBase64;

    @Column(nullable = false)
    private String adminUsername;

    @Column(nullable = false)
    private String adminPassword;

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
