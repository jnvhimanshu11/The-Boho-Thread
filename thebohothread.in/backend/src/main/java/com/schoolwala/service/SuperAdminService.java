package com.schoolwala.service;

import com.schoolwala.dto.SuperAdminDto;
import com.schoolwala.entity.School;
import com.schoolwala.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SuperAdminService {

    private final SchoolRepository schoolRepo;
    private final PasswordEncoder passwordEncoder;

    public SuperAdminDto.SchoolResponse createSchool(SuperAdminDto.CreateSchoolRequest req) {
        if (schoolRepo.existsBySchoolCode(req.getSchoolCode())) {
            throw new RuntimeException("School code already exists: " + req.getSchoolCode());
        }
        if (schoolRepo.existsByAdminUsername(req.getAdminUsername())) {
            throw new RuntimeException("Admin username already taken: " + req.getAdminUsername());
        }

        School school = School.builder()
                .schoolCode(req.getSchoolCode().toUpperCase())
                .schoolName(req.getSchoolName())
                .address(req.getAddress())
                .phone(req.getPhone())
                .email(req.getEmail())
                .adminUsername(req.getAdminUsername())
                .adminPassword(passwordEncoder.encode(req.getAdminPassword()))
                .build();

        return toResponse(schoolRepo.save(school));
    }

    public List<SuperAdminDto.SchoolResponse> getAllSchools() {
        return schoolRepo.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public SuperAdminDto.SchoolResponse getSchool(String schoolCode) {
        School school = schoolRepo.findBySchoolCode(schoolCode)
                .orElseThrow(() -> new RuntimeException("School not found: " + schoolCode));
        return toResponse(school);
    }

    public SuperAdminDto.SchoolResponse updateSchool(String schoolCode, SuperAdminDto.UpdateSchoolRequest req) {
        School school = schoolRepo.findBySchoolCode(schoolCode)
                .orElseThrow(() -> new RuntimeException("School not found: " + schoolCode));

        if (req.getSchoolName() != null) school.setSchoolName(req.getSchoolName());
        if (req.getAddress()    != null) school.setAddress(req.getAddress());
        if (req.getPhone()      != null) school.setPhone(req.getPhone());
        if (req.getEmail()      != null) school.setEmail(req.getEmail());

        if (req.getAdminUsername() != null && !req.getAdminUsername().equals(school.getAdminUsername())) {
            if (schoolRepo.existsByAdminUsername(req.getAdminUsername())) {
                throw new RuntimeException("Admin username already taken: " + req.getAdminUsername());
            }
            school.setAdminUsername(req.getAdminUsername());
        }

        if (req.getAdminPassword() != null && !req.getAdminPassword().isBlank()) {
            school.setAdminPassword(passwordEncoder.encode(req.getAdminPassword()));
        }

        return toResponse(schoolRepo.save(school));
    }

    public void deleteSchool(String schoolCode) {
        School school = schoolRepo.findBySchoolCode(schoolCode)
                .orElseThrow(() -> new RuntimeException("School not found: " + schoolCode));
        schoolRepo.delete(school);
    }

    public void resetPassword(String schoolCode, String newPassword) {
        School school = schoolRepo.findBySchoolCode(schoolCode)
                .orElseThrow(() -> new RuntimeException("School not found: " + schoolCode));
        school.setAdminPassword(passwordEncoder.encode(newPassword));
        schoolRepo.save(school);
    }

    private SuperAdminDto.SchoolResponse toResponse(School s) {
        return SuperAdminDto.SchoolResponse.builder()
                .id(s.getId())
                .schoolCode(s.getSchoolCode())
                .schoolName(s.getSchoolName())
                .address(s.getAddress())
                .phone(s.getPhone())
                .email(s.getEmail())
                .adminUsername(s.getAdminUsername())
                .hasLogo(s.getLogoBase64() != null && !s.getLogoBase64().isBlank())
                .createdAt(s.getCreatedAt() != null ? s.getCreatedAt().toString() : null)
                .updatedAt(s.getUpdatedAt() != null ? s.getUpdatedAt().toString() : null)
                .build();
    }
}
