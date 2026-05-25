package com.schoolwala.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String studentUniqueId;

    @Column(nullable = false)
    private String studentName;

    @Column(nullable = false)
    private String schoolCode;

    private String grade;
    private String section;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status; // PRESENT, ABSENT, LATE, HALF_DAY

    private String markedBy; // teacher/school uniqueId
    private String remarks;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum AttendanceStatus {
        PRESENT, ABSENT, LATE, HALF_DAY
    }
}
