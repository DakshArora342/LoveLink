package com.lovelink.controller;

import java.io.IOException;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.lovelink.extra.Constants;
import com.lovelink.io.UserRequestDTO;
import com.lovelink.io.UserResponseDTO;
import com.lovelink.security.AuthCookieUtil;
import com.lovelink.security.SecurityUtil;
import com.lovelink.service.AppSettingsService;
import com.lovelink.service.UserService;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
//@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
public class UserController {

	private final UserService userService;
	private final AppSettingsService appSettingsService;
	private final SecurityUtil securityUtil;
	private final AuthCookieUtil authCookieUtil;

	@GetMapping("/{id}")
	public ResponseEntity<UserResponseDTO> getUser(@PathVariable String id) {
		UserResponseDTO userById = userService.getUserById(id);

		UserResponseDTO currentUserDto = securityUtil.getCurrentUserDto();

		if (userById != null && currentUserDto != null) {
			if (!userById.getId().equals(currentUserDto.getId())) {
				throw new ResponseStatusException(HttpStatus.FORBIDDEN, Constants.ACCESS_DENIED);
			}
			return ResponseEntity.ok(userById);
		} else {
			return ResponseEntity.notFound().build();
		}
	}

	@GetMapping
	public ResponseEntity<UserResponseDTO> getUserByEmail(@RequestParam String email) {
		UserResponseDTO userByEmail = userService.getUserByEmail(email);

		UserResponseDTO currentUserDto = securityUtil.getCurrentUserDto();

		if (userByEmail != null && currentUserDto != null) {
			if (!userByEmail.getId().equals(currentUserDto.getId())) {
				throw new ResponseStatusException(HttpStatus.FORBIDDEN, Constants.ACCESS_DENIED);
			}
			return ResponseEntity.ok(userByEmail);
		} else {
			return ResponseEntity.notFound().build();
		}
	}

	@PostMapping("/login")
	public ResponseEntity<?> loginUser(@Valid @RequestBody UserRequestDTO userRequest, HttpServletResponse resp) {
		String email = userRequest.getEmail();
		String password = userRequest.getPassword();

		UserResponseDTO userByEmail = userService.getUserByEmail(email);

		// For security, return a generic message
		if (userByEmail == null) {
			clearAuthCookies(resp);
			return ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body("Invalid email or password");
		}

		// Check password
		if (!userService.verifyPassword(password, email)) {
			clearAuthCookies(resp);
			return ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body("Invalid email or password");
		}

		// Check if user is verified
		if (!userByEmail.isVerified()) {
			clearAuthCookies(resp);
			return ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body("Account not verified");
		}

		// Check if banned
		if (userByEmail.isBanned()) {
			clearAuthCookies(resp);
			return ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body("Access denied. User is banned.");
		}

		boolean active = appSettingsService.isMaintenanceMode();
		if (Boolean.TRUE.equals(active) && Boolean.FALSE.equals(userByEmail.isAdmin())) {
			return ResponseEntity.status(HttpServletResponse.SC_SERVICE_UNAVAILABLE)
					.body("The service is temporarily unavailable due to maintenance.");
		}

		userService.generateAndSetTokens(resp, email);

		return ResponseEntity.ok(Map.of("user",
				Map.of("id", userByEmail.getId(), "isAdmin", userByEmail.isAdmin(), "email", userByEmail.getEmail())));
	}

	// Helper to clear cookies
	private void clearAuthCookies(HttpServletResponse resp) {
		authCookieUtil.clearAuthCookies(resp);
	}

	@PostMapping("/verify-otp")
	public ResponseEntity<?> verifyOtp(@Valid @RequestBody UserRequestDTO userRequest, HttpServletResponse resp)
			throws IOException {
		String email = userRequest.getEmail();

		UserResponseDTO userByEmail = userService.getUserByEmail(email);
		if (userByEmail != null) {
			if (userByEmail.isVerified()) {
				return ResponseEntity.status(400).body("User already verified");
			}

			boolean verifyOtp = userService.verifyOtp(userRequest);

			if (verifyOtp) {
				userService.generateAndSetTokens(resp, email);
				return ResponseEntity.ok(Map.of("message", "OTP verified", "user", Map.of("id", userByEmail.getId())));
			}
		}
		return ResponseEntity.status(401).body("Invalid OTP");
	}

	@PostMapping
	public ResponseEntity<?> createUser(@Valid @RequestBody UserRequestDTO user) throws IOException {
		if (user.getEmail() == null || user.getPassword() == null) {
			return ResponseEntity.badRequest().body("Email and password are required");
		}

		// Check if user already exists
		UserResponseDTO userByEmail = userService.getUserByEmail(user.getEmail());
		if (userByEmail != null) {
			return ResponseEntity.status(409).body("User already exists with this email");
		}

		userService.registerUser(user);

		return ResponseEntity.ok(Map.of("message", "User registered. Please verify OTP sent to your email."));
	}

	@PostMapping("/refresh")
	@Transactional
	public ResponseEntity<?> refresh(@CookieValue(name = "refreshToken", required = false) String rt,
			HttpServletResponse resp) {
		if (rt == null) {
			return ResponseEntity.status(401).body("No refresh token");
		}

		userService.refresh(rt, resp);

		return ResponseEntity.ok(Map.of("message", "Tokens refreshed"));
	}

	@PostMapping("/resend-otp")
	public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> request) {
		String email = request.get("email");

		UserResponseDTO userByEmail = userService.getUserByEmail(email);
		if (userByEmail == null) {
			return ResponseEntity.status(404).body("User not found");
		}

		if (userByEmail.isVerified()) {
			return ResponseEntity.status(400).body("User already verified");
		}

		userService.generateAndSendOtp(email);

		return ResponseEntity.ok(Map.of("message", "OTP resent"));
	}

	@PostMapping("/forgot-password")
	public ResponseEntity<?> sendForgotOtp(@RequestBody Map<String, String> request) {
		String email = request.get("email");

		UserResponseDTO userByEmail = userService.getUserByEmail(email);
		if (userByEmail == null) {
			return ResponseEntity.status(404).body("User not found");
		}

		userService.generateAndSendOtp(email);

		return ResponseEntity.ok(Map.of("message", "Reset OTP sent to your email"));
	}

	@PostMapping("/reset-password")
	public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
		String email = request.get("email");

		UserResponseDTO userByEmail = userService.getUserByEmail(email);
		if (userByEmail == null) {
			return ResponseEntity.status(404).body("User not found");
		}

		UserResponseDTO userResponseDTO = userService.resetPassword(request);
		if (userResponseDTO == null) {
			return ResponseEntity.status(401).body("Invalid OTP");
		}

		return ResponseEntity.ok(Map.of("message", "Password reset successful"));
	}

}
