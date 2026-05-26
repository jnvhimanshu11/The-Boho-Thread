package com.schoolwala.controller;

import com.schoolwala.dto.UserDto;
import com.schoolwala.entity.Attendance;
import com.schoolwala.security.JwtAuthFilter;
import com.schoolwala.service.SchoolAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/school/admin")
@PreAuthorize("hasRole('SCHOOL_ADMIN')")
@RequiredArgsConstructor
public class SchoolAdminController {

    private final SchoolAdminService service;

    private String getSchoolCode(Authentication auth) {
        return ((JwtAuthFilter.JwtDetails) auth.getDetails()).schoolCode();
    }

    private String getUniqueId(Authentication auth) {
        return (String) auth.getPrincipal();
    }

    // ==================== Dashboard ====================
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(Authentication auth) {
        return ResponseEntity.ok(service.getSchoolReport(getSchoolCode(auth)));
    }

    // ==================== Teachers ====================
    @PostMapping("/teachers")
    public ResponseEntity<?> createTeacher(@RequestBody UserDto.CreateTeacherRequest req, Authentication auth) {
        try {
            return ResponseEntity.ok(service.createTeacher(getSchoolCode(auth), req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/teachers")
    public ResponseEntity<?> getAllTeachers(Authentication auth) {
        return ResponseEntity.ok(service.getAllTeachers(getSchoolCode(auth)));
    }

    @PatchMapping("/users/{uniqueId}/toggle")
    public ResponseEntity<?> toggleStatus(@PathVariable String uniqueId) {
        service.toggleUserStatus(uniqueId);
        return ResponseEntity.ok(Map.of("message", "Status updated"));
    }

    @PutMapping("/teachers/{uniqueId}")
    public ResponseEntity<?> updateTeacher(@PathVariable String uniqueId,
                                           @RequestBody UserDto.UpdateTeacherRequest req) {
        try {
            return ResponseEntity.ok(service.updateTeacher(uniqueId, req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/teachers/{uniqueId}")
    public ResponseEntity<?> deleteTeacher(@PathVariable String uniqueId) {
        try {
            service.deleteTeacher(uniqueId);
            return ResponseEntity.ok(Map.of("message", "Teacher permanently deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== Students ====================
    @PostMapping("/students")
    public ResponseEntity<?> createStudent(@RequestBody UserDto.CreateStudentRequest req, Authentication auth) {
        try {
            return ResponseEntity.ok(service.createStudent(getSchoolCode(auth), req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents(Authentication auth) {
        return ResponseEntity.ok(service.getAllStudents(getSchoolCode(auth)));
    }

    // ==================== Logo ====================
    @PutMapping("/logo")
    public ResponseEntity<?> updateLogo(@RequestBody UserDto.UpdateLogoRequest req, Authentication auth) {
        service.updateSchoolLogo(getSchoolCode(auth), req.getLogoBase64());
        return ResponseEntity.ok(Map.of("message", "Logo updated successfully"));
    }

    @GetMapping("/logo")
    public ResponseEntity<?> getLogo(Authentication auth) {
        String logo = service.getSchoolLogo(getSchoolCode(auth));
        return ResponseEntity.ok(Map.of("logoBase64", logo != null ? logo : ""));
    }

    // ==================== Attendance ====================
    @PostMapping("/attendance")
    public ResponseEntity<?> markAttendance(@RequestBody Map<String, Object> body, Authentication auth) {
        try {
            String studentId = (String) body.get("studentUniqueId");
            LocalDate date = LocalDate.parse((String) body.get("date"));
            Attendance.AttendanceStatus status = Attendance.AttendanceStatus.valueOf((String) body.get("status"));
            String remarks = (String) body.getOrDefault("remarks", "");
            return ResponseEntity.ok(service.markAttendance(
                    getSchoolCode(auth), studentId, date, status, getUniqueId(auth), remarks));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/attendance")
    public ResponseEntity<?> getAttendance(@RequestParam String date, Authentication auth) {
        return ResponseEntity.ok(service.getAttendanceByDate(getSchoolCode(auth), LocalDate.parse(date)));
    }

    @GetMapping("/attendance/student/{id}")
    public ResponseEntity<?> getStudentAttendance(@PathVariable String id,
                                                   @RequestParam String from,
                                                   @RequestParam String to) {
        return ResponseEntity.ok(service.getStudentAttendance(id, LocalDate.parse(from), LocalDate.parse(to)));
    }

    // ==================== Fees ====================
    @PostMapping("/fees")
    public ResponseEntity<?> addFee(@RequestBody Map<String, Object> body, Authentication auth) {
        try {
            String studentId = (String) body.get("studentUniqueId");
            String feeType = (String) body.get("feeType");
            Double amount = Double.parseDouble(body.get("totalAmount").toString());
            LocalDate dueDate = LocalDate.parse((String) body.get("dueDate"));
            return ResponseEntity.ok(service.addFee(
                    getSchoolCode(auth), studentId, feeType, amount, dueDate, getUniqueId(auth)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/fees/{id}/collect")
    public ResponseEntity<?> collectFee(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Double amount = Double.parseDouble(body.get("amount").toString());
            String mode = (String) body.getOrDefault("paymentMode", "Cash");
            String txnId = (String) body.getOrDefault("transactionId", "");
            return ResponseEntity.ok(service.collectFeePayment(id, amount, mode, txnId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/fees")
    public ResponseEntity<?> getAllFees(Authentication auth) {
        return ResponseEntity.ok(service.getFeesBySchool(getSchoolCode(auth)));
    }

    @GetMapping("/fees/student/{id}")
    public ResponseEntity<?> getStudentFees(@PathVariable String id) {
        return ResponseEntity.ok(service.getFeesByStudent(id));
    }

    // ==================== Reports ====================
    @GetMapping("/reports/summary")
    public ResponseEntity<?> getReport(Authentication auth) {
        return ResponseEntity.ok(service.getSchoolReport(getSchoolCode(auth)));
    }
}