package com.schoolwala.config;

import com.schoolwala.entity.School;
import com.schoolwala.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final SchoolRepository schoolRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!schoolRepo.existsBySchoolCode("SCH001")) {
            School school = School.builder()
                    .schoolCode("SCH001")
                    .schoolName("Delhi Public School")
                    .address("New Delhi, India")
                    .phone("+91-11-12345678")
                    .email("admin@dps.edu.in")
                    .adminUsername("admin")
                    .adminPassword(passwordEncoder.encode("admin123"))
                    .mustChangePassword(false)
                    .build();
            schoolRepo.save(school);
            log.info("=================================================");
            log.info("  SchoolWala Demo School Created:");
            log.info("  School Code : SCH001");
            log.info("  Username    : admin");
            log.info("  Password    : admin123");
            log.info("=================================================");
        }

        if (!schoolRepo.existsBySchoolCode("SCH002")) {
            School school2 = School.builder()
                    .schoolCode("SCH002")
                    .schoolName("Mumbai International School")
                    .address("Mumbai, Maharashtra, India")
                    .phone("+91-22-98765432")
                    .email("admin@mis.edu.in")
                    .adminUsername("miadmin")
                    .adminPassword(passwordEncoder.encode("mis2024"))
                    .mustChangePassword(false)
                    .build();
            schoolRepo.save(school2);
            log.info("  School 2 Created: SCH002 / miadmin / mis2024");
        }
    }
}