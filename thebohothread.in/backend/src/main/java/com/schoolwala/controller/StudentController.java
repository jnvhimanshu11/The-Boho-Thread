package com.schoolwala.controller;

import com.schoolwala.entity.School;
import com.schoolwala.repository.AttendanceRepository;
import com.schoolwala.repository.FeeRepository;
import com.schoolwala.repository.SchoolRepository;
import com.schoolwala.repository.UserRepository;
import com.schoolwala.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/student")
@PreAuthorize("hasRole('STUDENT')")
@RequiredArgsConstructor
public class StudentController {

    private final UserRepository userRepo;
    private final SchoolRepository schoolRepo;
    private final AttendanceRepository attendanceRepo;
    private final FeeRepository feeRepo;

    private String getSchoolCode(Authentication auth) {
        return ((JwtAuthFilter.JwtDetails) auth.getDetails()).schoolCode();
    }

    private String getUniqueId(Authentication auth) {
        return (String) auth.getPrincipal();
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication auth) {
        return ResponseEntity.ok(userRepo.findByUniqueId(getUniqueId(auth))
                .orElseThrow(() -> new RuntimeException("User not found")));
    }

    @GetMapping("/logo")
    public ResponseEntity<?> getLogo(Authentication auth) {
        String logo = schoolRepo.findBySchoolCode(getSchoolCode(auth))
                .map(School::getLogoBase64).orElse(null);
        return ResponseEntity.ok(Map.of("logoBase64", logo != null ? logo : ""));
    }

    @GetMapping("/attendance")
    public ResponseEntity<?> getMyAttendance(@RequestParam(required = false) String from,
                                              @RequestParam(required = false) String to,
                                              Authentication auth) {
        LocalDate fromDate = from != null ? LocalDate.parse(from) : LocalDate.now().withDayOfMonth(1);
        LocalDate toDate = to != null ? LocalDate.parse(to) : LocalDate.now();
        return ResponseEntity.ok(attendanceRepo.findByStudentUniqueIdAndDateBetween(
                getUniqueId(auth), fromDate, toDate));
    }

    @GetMapping("/fees")
    public ResponseEntity<?> getMyFees(Authentication auth) {
        return ResponseEntity.ok(feeRepo.findByStudentUniqueId(getUniqueId(auth)));
    }
}
