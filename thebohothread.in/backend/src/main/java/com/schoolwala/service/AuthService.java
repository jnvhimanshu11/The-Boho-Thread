package com.schoolwala.service;

import com.schoolwala.dto.AuthDto;
import com.schoolwala.entity.School;
import com.schoolwala.entity.User;
import com.schoolwala.repository.SchoolRepository;
import com.schoolwala.repository.UserRepository;
import com.schoolwala.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final SchoolRepository schoolRepo;
    private final UserRepository userRepo;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public AuthDto.LoginResponse schoolLogin(AuthDto.SchoolLoginRequest req) {
        School school = schoolRepo.findBySchoolCode(req.getSchoolCode())
                .orElseThrow(() -> new RuntimeException("School not found with code: " + req.getSchoolCode()));

        if (!school.getAdminUsername().equals(req.getUsername())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (!passwordEncoder.matches(req.getPassword(), school.getAdminPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtils.generateToken(
                school.getSchoolCode() + "_ADMIN",
                "SCHOOL_ADMIN",
                school.getSchoolCode(),
                school.getSchoolName()
        );

        return AuthDto.LoginResponse.builder()
                .token(token)
                .uniqueId(school.getSchoolCode() + "_ADMIN")
                .role("SCHOOL_ADMIN")
                .schoolCode(school.getSchoolCode())
                .fullName(school.getSchoolName())
                .schoolName(school.getSchoolName())
                .logoBase64(school.getLogoBase64())
                .build();
    }

    @Transactional(readOnly = true)
    public AuthDto.LoginResponse teacherLogin(AuthDto.UserLoginRequest req) {
        User user = userRepo.findByUniqueId(req.getUniqueId())
                .orElseThrow(() -> new RuntimeException("Teacher not found with ID: " + req.getUniqueId()));

        if (!user.getRole().name().equals("TEACHER")) {
            throw new RuntimeException("Not a teacher account");
        }

        if (!user.isActive()) {
            throw new RuntimeException("Account is deactivated");
        }

        // Block login if the school has been deleted
        if (!schoolRepo.existsBySchoolCode(user.getSchoolCode())) {
            throw new RuntimeException("Your school account no longer exists. Please contact the administrator.");
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        School school = schoolRepo.findBySchoolCode(user.getSchoolCode()).orElse(null);

        String token = jwtUtils.generateToken(
                user.getUniqueId(), "TEACHER", user.getSchoolCode(), user.getFullName()
        );

        return AuthDto.LoginResponse.builder()
                .token(token)
                .uniqueId(user.getUniqueId())
                .role("TEACHER")
                .schoolCode(user.getSchoolCode())
                .fullName(user.getFullName())
                .schoolName(school != null ? school.getSchoolName() : "")
                .logoBase64(school != null ? school.getLogoBase64() : null)
                .build();
    }

    @Transactional(readOnly = true)
    public AuthDto.LoginResponse studentLogin(AuthDto.UserLoginRequest req) {
        User user = userRepo.findByUniqueId(req.getUniqueId())
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + req.getUniqueId()));

        if (!user.getRole().name().equals("STUDENT")) {
            throw new RuntimeException("Not a student account");
        }

        if (!user.isActive()) {
            throw new RuntimeException("Account is deactivated");
        }

        // Block login if the school has been deleted
        if (!schoolRepo.existsBySchoolCode(user.getSchoolCode())) {
            throw new RuntimeException("Your school account no longer exists. Please contact the administrator.");
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        School school = schoolRepo.findBySchoolCode(user.getSchoolCode()).orElse(null);

        String token = jwtUtils.generateToken(
                user.getUniqueId(), "STUDENT", user.getSchoolCode(), user.getFullName()
        );

        return AuthDto.LoginResponse.builder()
                .token(token)
                .uniqueId(user.getUniqueId())
                .role("STUDENT")
                .schoolCode(user.getSchoolCode())
                .fullName(user.getFullName())
                .schoolName(school != null ? school.getSchoolName() : "")
                .logoBase64(school != null ? school.getLogoBase64() : null)
                .build();
    }
}