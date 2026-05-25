package com.schoolwala.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "fees")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fee {

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
    private String feeType; // Tuition, Transport, Library, Sports, etc.

    @Column(nullable = false)
    private Double totalAmount;

    private Double paidAmount;
    private Double pendingAmount;

    @Enumerated(EnumType.STRING)
    private FeeStatus status; // PAID, PENDING, PARTIAL, OVERDUE

    private LocalDate dueDate;
    private LocalDate paidDate;
    private String paymentMode; // Cash, Online, Cheque
    private String transactionId;
    private String remarks;
    private String collectedBy; // admin uniqueId

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (paidAmount == null) paidAmount = 0.0;
        pendingAmount = totalAmount - paidAmount;
        updateStatus();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        pendingAmount = totalAmount - (paidAmount == null ? 0.0 : paidAmount);
        updateStatus();
    }

    private void updateStatus() {
        if (paidAmount == null || paidAmount == 0) {
            status = FeeStatus.PENDING;
        } else if (paidAmount >= totalAmount) {
            status = FeeStatus.PAID;
        } else {
            status = FeeStatus.PARTIAL;
        }
        if (status != FeeStatus.PAID && dueDate != null && LocalDate.now().isAfter(dueDate)) {
            status = FeeStatus.OVERDUE;
        }
    }

    public enum FeeStatus {
        PAID, PENDING, PARTIAL, OVERDUE
    }
}
