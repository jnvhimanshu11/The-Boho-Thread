package com.schoolwala.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String uniqueId; // e.g., TCH001-SCH001, STU001-SCH001

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String password; // Encoded

    @Column(nullable = false)
    private String fullName;

    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private String schoolCode; // Link to School

    private String employeeId;      // Custom employee ID for teachers
    private String subject;         // For teachers
    private String classAssigned;   // For teachers
    private String grade;           // For students
    private String section;         // For students
    private String parentName;      // For students
    private String parentPhone;     // For students

    private boolean active = true;

    @Column(nullable = false)
    private boolean mustChangePassword = true; // Force password change on first login

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