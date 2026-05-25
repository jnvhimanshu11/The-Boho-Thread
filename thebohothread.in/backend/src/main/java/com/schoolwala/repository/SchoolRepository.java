package com.schoolwala.repository;

import com.schoolwala.entity.School;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SchoolRepository extends JpaRepository<School, Long> {
    Optional<School> findBySchoolCode(String schoolCode);
    Optional<School> findByAdminUsername(String adminUsername);
    boolean existsBySchoolCode(String schoolCode);
    boolean existsByAdminUsername(String adminUsername);
}
