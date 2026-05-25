package com.schoolwala.repository;

import com.schoolwala.entity.Role;
import com.schoolwala.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUniqueId(String uniqueId);
    Optional<User> findByUsername(String username);
    List<User> findBySchoolCodeAndRole(String schoolCode, Role role);
    List<User> findBySchoolCode(String schoolCode);
    boolean existsByUniqueId(String uniqueId);
    boolean existsByUsername(String username);
    long countBySchoolCodeAndRole(String schoolCode, Role role);
}
