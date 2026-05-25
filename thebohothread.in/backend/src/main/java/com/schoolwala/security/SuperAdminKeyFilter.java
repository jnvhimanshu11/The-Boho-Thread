package com.schoolwala.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SuperAdminKeyFilter extends OncePerRequestFilter {

    @Value("${schoolwala.superadmin.api-key}")
    private String superAdminApiKey;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        if (path.contains("/super-admin/")) {
            String providedKey = request.getHeader("X-Super-Admin-Key");

            if (providedKey == null || !providedKey.equals(superAdminApiKey)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Invalid or missing Super Admin API key\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
