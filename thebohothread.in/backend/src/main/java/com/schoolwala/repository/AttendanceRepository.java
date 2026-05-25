package com.schoolwala.repository;

import com.schoolwala.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findBySchoolCodeAndDate(String schoolCode, LocalDate date);
    List<Attendance> findByStudentUniqueIdAndDateBetween(String uniqueId, LocalDate from, LocalDate to);
    List<Attendance> findBySchoolCodeAndDateBetween(String schoolCode, LocalDate from, LocalDate to);
    List<Attendance> findBySchoolCodeAndGradeAndSection(String schoolCode, String grade, String section);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.studentUniqueId = :uid AND a.status = 'PRESENT' AND a.date BETWEEN :from AND :to")
    long countPresentDays(String uid, LocalDate from, LocalDate to);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.studentUniqueId = :uid AND a.date BETWEEN :from AND :to")
    long countTotalDays(String uid, LocalDate from, LocalDate to);
}
