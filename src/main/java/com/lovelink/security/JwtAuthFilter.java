package com.lovelink.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.lovelink.entity.User;
import com.lovelink.extra.Constants;
import com.lovelink.repo.UserRepository;
import com.lovelink.service.AppSettingsService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {
	private final JwtUtil jwtUtil;
	private final UserRepository userRepository;
	private final AppSettingsService appSettingsService;
	
	private final String cookieSameSiteAttribute = Constants.SAME_SITE_ATTRIBUTE;

	public JwtAuthFilter(JwtUtil jwtUtil, UserRepository userRepository, AppSettingsService appSettingsService) {
		this.jwtUtil = jwtUtil;
		this.userRepository = userRepository;
		this.appSettingsService = appSettingsService;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
			throws ServletException, IOException {

		String path = req.getRequestURI();
		String token = null;

		// ✅ Extract JWT from HttpOnly cookie named "accessToken"
		if (req.getCookies() != null) {
			for (var cookie : req.getCookies()) {
				if ("accessToken".equals(cookie.getName())) {
					token = cookie.getValue();
					break;
				}
			}
		}

		// If no token found, skip authentication and continue
		if (token == null) {
			chain.doFilter(req, res);
			return;
		}

		try {
			Claims claims = jwtUtil.parseClaims(token);
			String userId = claims.getSubject();
			int tokenVer = claims.get("ver", Integer.class);

			// 🔒 Fetch user from DB
			User user = userRepository.findById(userId).orElse(null);
			if (user == null || user.getTokenVersion() != tokenVer) {
				res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
				res.getWriter().write("Token invalid or expired");
				res.setHeader("Set-Cookie", "accessToken=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=" + cookieSameSiteAttribute);
				res.addHeader("Set-Cookie",
						"refreshToken=; Max-Age=0; Path=/api/users; HttpOnly; Secure; SameSite=" + cookieSameSiteAttribute);
				return;
			}

			if (user == null || Boolean.TRUE.equals(user.getIsBanned())) {
				res.setStatus(HttpServletResponse.SC_FORBIDDEN);
				res.getWriter().write("Access denied. User is banned.");
				return;
			}

			// 🔧 Maintenance Mode logic
			boolean isExcludedPath = path.equals("/api/user-profiles");
			if (!isExcludedPath) {
				boolean active = appSettingsService.isMaintenanceMode();
				if (Boolean.TRUE.equals(active) && Boolean.FALSE.equals(user.getIsAdmin())) {
					res.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
					res.getWriter().write("The service is temporarily unavailable due to maintenance.");
					return;
				}
			}

			// ✅ Set Authentication in Security Context
			UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userId, null, List.of());
			SecurityContextHolder.getContext().setAuthentication(auth);

		} catch (JwtException e) {
			log.warn("JWT error: {}", e);
		}

		chain.doFilter(req, res);
	}

}
