package com.schoolwala.controller;

import com.schoolwala.dto.UserDto;
import com.schoolwala.entity.Attendance;
import com.schoolwala.security.JwtAuthFilter;
import com.schoolwala.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/teacher")
@PreAuthorize("hasRole('TEACHER')")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService service;

    private String getSchoolCode(Authentication auth) {
        return ((JwtAuthFilter.JwtDetails) auth.getDetails()).schoolCode();
    }

    private String getUniqueId(Authentication auth) {
        return (String) auth.getPrincipal();
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication auth) {
        return ResponseEntity.ok(service.getProfile(getUniqueId(auth)));
    }

    @GetMapping("/logo")
    public ResponseEntity<?> getLogo(Authentication auth) {
        String logo = service.getSchoolLogo(getSchoolCode(auth));
        return ResponseEntity.ok(Map.of("logoBase64", logo != null ? logo : ""));
    }

    @PostMapping("/students")
    public ResponseEntity<?> createStudent(@RequestBody UserDto.CreateStudentRequest req, Authentication auth) {
        try {
            return ResponseEntity.ok(service.createStudent(getSchoolCode(auth), req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/students")
    public ResponseEntity<?> getStudents(Authentication auth) {
        return ResponseEntity.ok(service.getMyStudents(getSchoolCode(auth)));
    }

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
}
