package com.schoolwala.security;

import com.schoolwala.repository.SchoolRepository;
import com.schoolwala.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserRepository userRepo;
    private final SchoolRepository schoolRepo;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = parseJwt(request);

        if (token != null && jwtUtils.validateToken(token)) {
            String uniqueId   = jwtUtils.extractUniqueId(token);
            String role       = jwtUtils.extractRole(token);
            String schoolCode = jwtUtils.extractSchoolCode(token);

            // ── SCHOOL_ADMIN: check school still exists ───────────────
            if ("SCHOOL_ADMIN".equals(role)) {
                if (!schoolRepo.existsBySchoolCode(schoolCode)) {
                    sendUnauthorized(response, "School account no longer exists. Please contact the super admin.");
                    return;
                }
            }

            // ── TEACHER / STUDENT: check account active + school exists ──
            if ("TEACHER".equals(role) || "STUDENT".equals(role)) {

                // 1. Check school still exists (auto-logout when school is deleted)
                if (!schoolRepo.existsBySchoolCode(schoolCode)) {
                    sendUnauthorized(response, "Your school account no longer exists. Please contact the administrator.");
                    return;
                }

                // 2. Check user account is still active
                boolean isActive = userRepo.findByUniqueId(uniqueId)
                        .map(user -> user.isActive())
                        .orElse(false);

                if (!isActive) {
                    sendUnauthorized(response, "Account has been deactivated. Please contact your school admin.");
                    return;
                }
            }

            var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
            var auth = new UsernamePasswordAuthenticationToken(uniqueId, null, authorities);
            auth.setDetails(new JwtDetails(uniqueId, role, schoolCode));
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        filterChain.doFilter(request, response);
    }

    private void sendUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"" + message + "\"}");
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }

    public record JwtDetails(String uniqueId, String role, String schoolCode) {}
}