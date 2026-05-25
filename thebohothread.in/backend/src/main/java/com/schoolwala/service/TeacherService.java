package com.schoolwala.service;

import com.schoolwala.dto.UserDto;
import com.schoolwala.entity.*;
import com.schoolwala.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final UserRepository userRepo;
    private final SchoolRepository schoolRepo;
    private final AttendanceRepository attendanceRepo;
    private final PasswordEncoder passwordEncoder;

    // Teachers can create student accounts
    @Transactional
    public UserDto.UserResponse createStudent(String schoolCode, UserDto.CreateStudentRequest req) {
        long count = userRepo.countBySchoolCodeAndRole(schoolCode, Role.STUDENT);
        String uniqueId = String.format("STU%04d-%s", count + 1, schoolCode);

        User student = User.builder()
                .uniqueId(uniqueId)
                .username(uniqueId.toLowerCase())
                .password(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .address(req.getAddress())
                .dateOfBirth(req.getDateOfBirth())
                .role(Role.STUDENT)
                .schoolCode(schoolCode)
                .grade(req.getGrade())
                .section(req.getSection())
                .parentName(req.getParentName())
                .parentPhone(req.getParentPhone())
                .active(true)
                .build();

        return mapToResponse(userRepo.save(student));
    }

    public List<UserDto.UserResponse> getMyStudents(String schoolCode) {
        return userRepo.findBySchoolCodeAndRole(schoolCode, Role.STUDENT)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public Attendance markAttendance(String schoolCode, String studentUniqueId,
                                     LocalDate date, Attendance.AttendanceStatus status,
                                     String markedBy, String remarks) {
        User student = userRepo.findByUniqueId(studentUniqueId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Attendance a = Attendance.builder()
                .studentUniqueId(studentUniqueId)
                .studentName(student.getFullName())
                .schoolCode(schoolCode)
                .grade(student.getGrade())
                .section(student.getSection())
                .date(date)
                .status(status)
                .markedBy(markedBy)
                .remarks(remarks)
                .build();

        return attendanceRepo.save(a);
    }

    public List<Attendance> getAttendanceByDate(String schoolCode, LocalDate date) {
        return attendanceRepo.findBySchoolCodeAndDate(schoolCode, date);
    }

    public UserDto.UserResponse getProfile(String uniqueId) {
        return mapToResponse(userRepo.findByUniqueId(uniqueId)
                .orElseThrow(() -> new RuntimeException("User not found")));
    }

    public String getSchoolLogo(String schoolCode) {
        return schoolRepo.findBySchoolCode(schoolCode)
                .map(School::getLogoBase64)
                .orElse(null);
    }

    private UserDto.UserResponse mapToResponse(User u) {
        return UserDto.UserResponse.builder()
                .id(u.getId())
                .uniqueId(u.getUniqueId())
                .username(u.getUsername())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .dateOfBirth(u.getDateOfBirth())
                .address(u.getAddress())
                .role(u.getRole().name())
                .schoolCode(u.getSchoolCode())
                .subject(u.getSubject())
                .classAssigned(u.getClassAssigned())
                .grade(u.getGrade())
                .section(u.getSection())
                .parentName(u.getParentName())
                .parentPhone(u.getParentPhone())
                .active(u.isActive())
                .build();
    }
}
