package com.schoolwala.security;

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

            // Check active status on every request for TEACHER and STUDENT
            if ("TEACHER".equals(role) || "STUDENT".equals(role)) {
                boolean isActive = userRepo.findByUniqueId(uniqueId)
                        .map(user -> user.isActive())
                        .orElse(false);

                if (!isActive) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write(
                        "{\"error\": \"Account has been deactivated. Please contact your school admin.\"}"
                    );
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

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }

    public record JwtDetails(String uniqueId, String role, String schoolCode) {}
}
