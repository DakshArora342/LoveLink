package com.lovelink.security;

import java.util.Arrays;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.lovelink.repo.RefreshTokenRepo;
import com.lovelink.repo.UserRepository;
import com.lovelink.service.AppSettingsService;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

	@Value("${lovelink.url}")
	private String url;

	@Bean
	SecurityFilterChain filterChain(HttpSecurity http, JwtUtil jwtUtil, RefreshTokenRepo refreshRepo,
			UserRepository userRepository, AppSettingsService appSettingsService) throws Exception {

		http.cors(cors -> cors.configurationSource(corsConfigurationSource())).csrf(csrf -> csrf.disable())
				.sessionManagement(session -> session
						.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(auth -> auth.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

						// ✅ Allow frontend static files
						.requestMatchers("/", "/index.html", "/features", "/auth", "/profile-setup", "/banned",
								"/maintenance", "/favicon.ico", "/manifest.json", "/robots.txt", "/assets/**",
								"/icons/**", "/static/**", "/public/**")
						.permitAll()

						.requestMatchers("/ws-chat/**", "/api/users/forgot-password", "/api/users/reset-password",
								"/api/users/resend-otp", "/csrf-token")
						.permitAll().requestMatchers(HttpMethod.POST, "/api/users").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/users/login").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/users/verify-otp").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/users/refresh").permitAll().anyRequest()
						.authenticated())
				.addFilterBefore(new JwtAuthFilter(jwtUtil, userRepository, appSettingsService),
						UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	@Bean
	CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowedOriginPatterns(Collections.singletonList(url)); // dev only
		config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
		config.setAllowCredentials(true);

		config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-XSRF-TOKEN", "X-Requested-With"));
		config.setExposedHeaders(Arrays.asList("X-XSRF-TOKEN"));
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		return source;
	}

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}