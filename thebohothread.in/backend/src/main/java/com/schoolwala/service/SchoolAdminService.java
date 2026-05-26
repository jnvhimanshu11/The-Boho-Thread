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
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SchoolAdminService {

    private final UserRepository userRepo;
    private final SchoolRepository schoolRepo;
    private final AttendanceRepository attendanceRepo;
    private final FeeRepository feeRepo;
    private final PasswordEncoder passwordEncoder;

    // ==================== Teacher Management ====================

    @Transactional
    public UserDto.UserResponse createTeacher(String schoolCode, UserDto.CreateTeacherRequest req) {
        long count = userRepo.countBySchoolCodeAndRole(schoolCode, Role.TEACHER);
        String uniqueId = String.format("TCH%03d-%s", count + 1, schoolCode);

        User teacher = User.builder()
                .uniqueId(uniqueId)
                .username(uniqueId.toLowerCase())
                .password(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .address(req.getAddress())
                .dateOfBirth(req.getDateOfBirth())
                .role(Role.TEACHER)
                .schoolCode(schoolCode)
                .employeeId(req.getEmployeeId())
                .subject(req.getSubject())
                .classAssigned(req.getClassAssigned())
                .active(true)
                .build();

        return mapToResponse(userRepo.save(teacher));
    }

    // ==================== Student Management ====================

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

    public List<UserDto.UserResponse> getAllTeachers(String schoolCode) {
        return userRepo.findBySchoolCodeAndRole(schoolCode, Role.TEACHER)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<UserDto.UserResponse> getAllStudents(String schoolCode) {
        return userRepo.findBySchoolCodeAndRole(schoolCode, Role.STUDENT)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public UserDto.UserResponse getUserByUniqueId(String uniqueId) {
        return mapToResponse(userRepo.findByUniqueId(uniqueId)
                .orElseThrow(() -> new RuntimeException("User not found")));
    }

    @Transactional
    public UserDto.UserResponse updateTeacher(String uniqueId, UserDto.UpdateTeacherRequest req) {
        User user = userRepo.findByUniqueId(uniqueId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        if (req.getEmployeeId() != null) user.setEmployeeId(req.getEmployeeId());
        if (req.getFullName() != null)   user.setFullName(req.getFullName());
        if (req.getEmail() != null)      user.setEmail(req.getEmail());
        if (req.getPhone() != null)      user.setPhone(req.getPhone());
        if (req.getAddress() != null)    user.setAddress(req.getAddress());
        if (req.getDateOfBirth() != null) user.setDateOfBirth(req.getDateOfBirth());
        if (req.getSubject() != null)    user.setSubject(req.getSubject());
        if (req.getClassAssigned() != null) user.setClassAssigned(req.getClassAssigned());
        return mapToResponse(userRepo.save(user));
    }

    @Transactional
    public void deleteTeacher(String uniqueId) {
        User user = userRepo.findByUniqueId(uniqueId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        userRepo.delete(user);
    }

    @Transactional
    public void toggleUserStatus(String uniqueId) {
        User user = userRepo.findByUniqueId(uniqueId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(!user.isActive());
        userRepo.save(user);
    }

    // ==================== Logo Management ====================

    @Transactional
    public void updateSchoolLogo(String schoolCode, String logoBase64) {
        School school = schoolRepo.findBySchoolCode(schoolCode)
                .orElseThrow(() -> new RuntimeException("School not found"));
        school.setLogoBase64(logoBase64);
        schoolRepo.save(school);
    }

    public String getSchoolLogo(String schoolCode) {
        return schoolRepo.findBySchoolCode(schoolCode)
                .map(School::getLogoBase64)
                .orElse(null);
    }

    // ==================== Attendance ====================

    @Transactional
    public Attendance markAttendance(String schoolCode, String studentUniqueId,
                                     LocalDate date, Attendance.AttendanceStatus status,
                                     String markedBy, String remarks) {
        User student = userRepo.findByUniqueId(studentUniqueId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Attendance attendance = Attendance.builder()
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

        return attendanceRepo.save(attendance);
    }

    public List<Attendance> getAttendanceByDate(String schoolCode, LocalDate date) {
        return attendanceRepo.findBySchoolCodeAndDate(schoolCode, date);
    }

    public List<Attendance> getStudentAttendance(String studentId, LocalDate from, LocalDate to) {
        return attendanceRepo.findByStudentUniqueIdAndDateBetween(studentId, from, to);
    }

    // ==================== Fees ====================

    @Transactional
    public Fee addFee(String schoolCode, String studentUniqueId, String feeType,
                      Double totalAmount, LocalDate dueDate, String collectedBy) {
        User student = userRepo.findByUniqueId(studentUniqueId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Fee fee = Fee.builder()
                .studentUniqueId(studentUniqueId)
                .studentName(student.getFullName())
                .schoolCode(schoolCode)
                .grade(student.getGrade())
                .section(student.getSection())
                .feeType(feeType)
                .totalAmount(totalAmount)
                .paidAmount(0.0)
                .dueDate(dueDate)
                .collectedBy(collectedBy)
                .build();

        return feeRepo.save(fee);
    }

    @Transactional
    public Fee collectFeePayment(Long feeId, Double amount, String paymentMode, String transactionId) {
        Fee fee = feeRepo.findById(feeId)
                .orElseThrow(() -> new RuntimeException("Fee record not found"));
        fee.setPaidAmount((fee.getPaidAmount() == null ? 0 : fee.getPaidAmount()) + amount);
        fee.setPaymentMode(paymentMode);
        fee.setTransactionId(transactionId);
        fee.setPaidDate(LocalDate.now());
        return feeRepo.save(fee);
    }

    public List<Fee> getFeesBySchool(String schoolCode) {
        return feeRepo.findBySchoolCode(schoolCode);
    }

    public List<Fee> getFeesByStudent(String studentId) {
        return feeRepo.findByStudentUniqueId(studentId);
    }

    // ==================== Reports ====================

    public Map<String, Object> getSchoolReport(String schoolCode) {
        long totalTeachers = userRepo.countBySchoolCodeAndRole(schoolCode, Role.TEACHER);
        long totalStudents = userRepo.countBySchoolCodeAndRole(schoolCode, Role.STUDENT);
        Double totalFees = feeRepo.sumTotalBySchool(schoolCode);
        Double collectedFees = feeRepo.sumPaidBySchool(schoolCode);
        Double pendingFees = feeRepo.sumPendingBySchool(schoolCode);

        return Map.of(
                "totalTeachers", totalTeachers,
                "totalStudents", totalStudents,
                "totalFees", totalFees != null ? totalFees : 0.0,
                "collectedFees", collectedFees != null ? collectedFees : 0.0,
                "pendingFees", pendingFees != null ? pendingFees : 0.0
        );
    }

    private UserDto.UserResponse mapToResponse(User u) {
        return UserDto.UserResponse.builder()
                .id(u.getId())
                .uniqueId(u.getUniqueId())
                .employeeId(u.getEmployeeId())
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
                .mustChangePassword(u.isMustChangePassword())
                .build();
    }
}