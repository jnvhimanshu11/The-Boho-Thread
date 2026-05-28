package com.schoolwala.repository;

import com.schoolwala.entity.Fee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeeRepository extends JpaRepository<Fee, Long> {
    List<Fee> findBySchoolCode(String schoolCode);
    List<Fee> findByStudentUniqueId(String uniqueId);
    List<Fee> findBySchoolCodeAndStatus(String schoolCode, Fee.FeeStatus status);

    // ── Used for cascade delete when a school is removed ─────────
    @Modifying
    @Query("DELETE FROM Fee f WHERE f.schoolCode = :schoolCode")
    void deleteAllBySchoolCode(String schoolCode);

    @Query("SELECT SUM(f.totalAmount) FROM Fee f WHERE f.schoolCode = :sc")
    Double sumTotalBySchool(String sc);

    @Query("SELECT SUM(f.paidAmount) FROM Fee f WHERE f.schoolCode = :sc")
    Double sumPaidBySchool(String sc);

    @Query("SELECT SUM(f.pendingAmount) FROM Fee f WHERE f.schoolCode = :sc AND f.status != 'PAID'")
    Double sumPendingBySchool(String sc);
}