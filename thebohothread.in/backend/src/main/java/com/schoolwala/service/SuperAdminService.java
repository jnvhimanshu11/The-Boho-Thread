package com.schoolwala.service;

import com.schoolwala.dto.SuperAdminDto;
import com.schoolwala.entity.School;
import com.schoolwala.repository.AttendanceRepository;
import com.schoolwala.repository.FeeRepository;
import com.schoolwala.repository.SchoolRepository;
import com.schoolwala.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SuperAdminService {

    private final SchoolRepository    schoolRepo;
    private final UserRepository      userRepo;
    private final AttendanceRepository attendanceRepo;
    private final FeeRepository       feeRepo;
    private final PasswordEncoder     passwordEncoder;

    public SuperAdminDto.SchoolResponse createSchool(SuperAdminDto.CreateSchoolRequest req) {
        if (schoolRepo.existsBySchoolCode(req.getSchoolCode()))
            throw new RuntimeException("School code already exists: " + req.getSchoolCode());
        if (schoolRepo.existsByAdminUsername(req.getAdminUsername()))
            throw new RuntimeException("Admin username already taken: " + req.getAdminUsername());

        String address = buildAddress(req.getLocality(), req.getCity(), req.getState());

        School school = School.builder()
                .schoolCode(req.getSchoolCode().toUpperCase())
                .schoolName(req.getSchoolName())
                .affiliationNo(req.getAffiliationNo())
                .boardType(req.getBoardType())
                .schoolType(req.getSchoolType())
                .establishedYear(req.getEstablishedYear())
                .websiteUrl(req.getWebsiteUrl())
                .state(req.getState())
                .city(req.getCity())
                .locality(req.getLocality())
                .address(address)
                .phone(req.getPhone())
                .email(req.getEmail())
                .principalName(req.getPrincipalName())
                .principalContact(req.getPrincipalContact())
                .primaryColor(req.getPrimaryColor() != null ? req.getPrimaryColor() : "#4f46e5")
                .logoBase64(req.getLogoBase64())
                .bannerBase64(req.getBannerBase64())
                .adminUsername(req.getAdminUsername())
                .adminPassword(passwordEncoder.encode(req.getAdminPassword()))
                .build();

        return toResponse(schoolRepo.save(school));
    }

    public List<SuperAdminDto.SchoolResponse> getAllSchools() {
        return schoolRepo.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public SuperAdminDto.SchoolResponse getSchool(String schoolCode) {
        return toResponse(findOrThrow(schoolCode));
    }

    public SuperAdminDto.SchoolResponse updateSchool(String schoolCode, SuperAdminDto.UpdateSchoolRequest req) {
        School school = findOrThrow(schoolCode);

        if (req.getSchoolName()       != null) school.setSchoolName(req.getSchoolName());
        if (req.getAffiliationNo()    != null) school.setAffiliationNo(req.getAffiliationNo());
        if (req.getBoardType()        != null) school.setBoardType(req.getBoardType());
        if (req.getSchoolType()       != null) school.setSchoolType(req.getSchoolType());
        if (req.getEstablishedYear()  != null) school.setEstablishedYear(req.getEstablishedYear());
        if (req.getWebsiteUrl()       != null) school.setWebsiteUrl(req.getWebsiteUrl());
        if (req.getState()            != null) school.setState(req.getState());
        if (req.getCity()             != null) school.setCity(req.getCity());
        if (req.getLocality()         != null) school.setLocality(req.getLocality());
        if (req.getPhone()            != null) school.setPhone(req.getPhone());
        if (req.getEmail()            != null) school.setEmail(req.getEmail());
        if (req.getPrincipalName()    != null) school.setPrincipalName(req.getPrincipalName());
        if (req.getPrincipalContact() != null) school.setPrincipalContact(req.getPrincipalContact());
        if (req.getPrimaryColor()     != null) school.setPrimaryColor(req.getPrimaryColor());
        if (req.getLogoBase64()       != null) school.setLogoBase64(req.getLogoBase64());
        if (req.getBannerBase64()     != null) school.setBannerBase64(req.getBannerBase64());

        if (req.getAdminUsername() != null && !req.getAdminUsername().equals(school.getAdminUsername())) {
            if (schoolRepo.existsByAdminUsername(req.getAdminUsername()))
                throw new RuntimeException("Admin username already taken: " + req.getAdminUsername());
            school.setAdminUsername(req.getAdminUsername());
        }
        if (req.getAdminPassword() != null && !req.getAdminPassword().isBlank())
            school.setAdminPassword(passwordEncoder.encode(req.getAdminPassword()));

        school.setAddress(buildAddress(school.getLocality(), school.getCity(), school.getState()));

        return toResponse(schoolRepo.save(school));
    }

    // ── Delete single school + ALL related data ───────────────────
    // JwtAuthFilter checks schoolRepo.existsBySchoolCode() on every
    // request — once school is deleted here, ALL active tokens for
    // this school get 401 immediately → auto-logout for everyone.
    @Transactional
    public void deleteSchool(String schoolCode) {
        School school = findOrThrow(schoolCode);

        // 1. Delete all fees for this school
        feeRepo.deleteAllBySchoolCode(schoolCode);

        // 2. Delete all attendance records for this school
        attendanceRepo.deleteAllBySchoolCode(schoolCode);

        // 3. Delete all users (teachers + students) for this school
        userRepo.deleteAll(userRepo.findBySchoolCode(schoolCode));

        // 4. Delete the school itself
        // After this line, JwtAuthFilter returns 401 for all
        // existing tokens that carry this schoolCode → instant logout
        schoolRepo.delete(school);
    }

    // ── Bulk delete ───────────────────────────────────────────────
    @Transactional
    public SuperAdminDto.BulkDeleteResponse deleteSchoolsBulk(List<String> schoolCodes) {
        List<String> deleted  = new java.util.ArrayList<>();
        List<String> notFound = new java.util.ArrayList<>();

        for (String code : schoolCodes) {
            schoolRepo.findBySchoolCode(code).ifPresentOrElse(
                s -> { deleteSchool(code); deleted.add(code); },
                ()  -> notFound.add(code)
            );
        }

        return SuperAdminDto.BulkDeleteResponse.builder()
                .deleted(deleted).notFound(notFound)
                .deletedCount(deleted.size()).notFoundCount(notFound.size())
                .build();
    }

    public void resetPassword(String schoolCode, String newPassword) {
        School school = findOrThrow(schoolCode);
        school.setAdminPassword(passwordEncoder.encode(newPassword));
        schoolRepo.save(school);
    }

    // ── Helpers ───────────────────────────────────────────────────

    private School findOrThrow(String schoolCode) {
        return schoolRepo.findBySchoolCode(schoolCode)
                .orElseThrow(() -> new RuntimeException("School not found: " + schoolCode));
    }

    private String buildAddress(String locality, String city, String state) {
        return java.util.stream.Stream.of(locality, city, state)
                .filter(s -> s != null && !s.isBlank())
                .collect(Collectors.joining(", "));
    }

    private SuperAdminDto.SchoolResponse toResponse(School s) {
        return SuperAdminDto.SchoolResponse.builder()
                .id(s.getId())
                .schoolCode(s.getSchoolCode())
                .schoolName(s.getSchoolName())
                .affiliationNo(s.getAffiliationNo())
                .boardType(s.getBoardType())
                .schoolType(s.getSchoolType())
                .establishedYear(s.getEstablishedYear())
                .websiteUrl(s.getWebsiteUrl())
                .state(s.getState())
                .city(s.getCity())
                .locality(s.getLocality())
                .address(s.getAddress())
                .phone(s.getPhone())
                .email(s.getEmail())
                .principalName(s.getPrincipalName())
                .principalContact(s.getPrincipalContact())
                .primaryColor(s.getPrimaryColor() != null ? s.getPrimaryColor() : "#4f46e5")
                .adminUsername(s.getAdminUsername())
                .hasLogo(s.getLogoBase64() != null && !s.getLogoBase64().isBlank())
                .hasBanner(s.getBannerBase64() != null && !s.getBannerBase64().isBlank())
                .logoBase64(s.getLogoBase64())
                .createdAt(s.getCreatedAt() != null ? s.getCreatedAt().toString() : null)
                .updatedAt(s.getUpdatedAt() != null ? s.getUpdatedAt().toString() : null)
                .build();
    }
}