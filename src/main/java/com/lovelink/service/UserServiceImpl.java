package com.lovelink.service;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.lovelink.entity.RefreshToken;
import com.lovelink.entity.User;
import com.lovelink.entity.UserProfile;
import com.lovelink.io.UserRequestDTO;
import com.lovelink.io.UserResponseDTO;
import com.lovelink.repo.RefreshTokenRepo;
import com.lovelink.repo.UserRepository;
import com.lovelink.security.AuthCookieUtil;
import com.lovelink.security.JwtUtil;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final ModelMapper modelMapper;
	private final EmailService emailService;
	private final JwtUtil jwtUtil;
	private final RefreshTokenRepo refreshRepo;
	private final AuthCookieUtil authCookieUtil;
	private final UserProfileService userProfileService;

	@Value("${lovelink.admin.email}")
	private String adminEmail;

	public UserResponseDTO saveUser(User user) {
		if (user.getEmail() == null || user.getEmail().isEmpty()) {
			throw new IllegalArgumentException("Email cannot be null or empty");
		}
		return modelMapper.map(userRepository.save(user), UserResponseDTO.class);
	}

	public UserResponseDTO getUserById(String id) {
		return userRepository.findById(id).map(user -> modelMapper.map(user, UserResponseDTO.class)).orElse(null);
	}

	public UserResponseDTO getUserByEmail(String email) {
		return userRepository.findByEmail(email).map(user -> modelMapper.map(user, UserResponseDTO.class)).orElse(null);
	}

	public boolean verifyPassword(String rawPassword, String email) {
		Optional<User> userOptional = userRepository.findByEmail(email);
		if (userOptional.isEmpty()) {
			return false;
		}
		return passwordEncoder.matches(rawPassword, userOptional.get().getPassword()); // 👈 Secure compare
	}

	@Override
	public UserResponseDTO resetPassword(Map<String, String> request) {
		String email = request.get("email");
		String otp = request.get("otp");
		String newPassword = request.get("newPassword");

		if (email == null || otp == null || newPassword == null) {
			throw new ValidationException("Missing email, OTP or new password");
		}

		Optional<User> userOptional = userRepository.findByEmail(email);
		if (userOptional.isEmpty()) {
			return null;
		}

		User user = userOptional.get();
		if (!user.getOtp().equals(otp)) {
			return null;
		}

		user.setPassword(passwordEncoder.encode(newPassword));
		user.setOtp(null); // Clear OTP

		user.setTokenVersion(user.getTokenVersion() + 1);

		return saveUser(user);
	}

	@Override
	public void generateAndSendOtp(String email) {

		Optional<User> userOptional = userRepository.findByEmail(email);
		if (userOptional.isEmpty()) {
			return;
		}

		User user = userOptional.get();
		String resetOtp = String.valueOf((int) (Math.random() * 900000) + 100000);
		user.setOtp(resetOtp); // Reuse OTP field
		saveUser(user);

		emailService.sendOtpEmail(email, resetOtp);

	}

	public void refresh(String rt, HttpServletResponse resp) {

		try {
			// Parse refresh token claims
			Claims claims = jwtUtil.parseClaims(rt);
			String tid = claims.get("tid", String.class);
			if (tid == null) {
				throw new ValidationException("Missing token ID");
			}

			Integer tokenVer = claims.get("ver", Integer.class); // 👈

			// Lookup old refresh token in DB
			Optional<RefreshToken> existingRt = refreshRepo.findById(tid);
			if (existingRt.isEmpty()) {
				throw new ValidationException("Invalid refresh token");
			}

			User user = existingRt.get().getUser();

			if (user.getTokenVersion() != tokenVer) {
				throw new ValidationException("Refresh token invalid");
			}

			refreshRepo.deleteAllByUser(user); // invalidate all old tokens

			generateAndSetTokens(resp, user.getEmail());

		} catch (JwtException e) {
			throw new ValidationException("Invalid or expired refresh token");
		}
	}

	public void generateAndSetTokens(HttpServletResponse resp, String email) {

		User user = userRepository.findByEmail(email).orElseThrow(() -> new ValidationException("User not found"));

		// Generate tokens
		String accessToken = jwtUtil.generateAccessToken(user);
		String tokenId = UUID.randomUUID().toString();
		String refreshToken = jwtUtil.generateRefreshToken(user, tokenId);

		// Save refresh token (consider hashing in production)
		RefreshToken refreshTokenEntity = new RefreshToken();
		refreshTokenEntity.setId(tokenId);
		refreshTokenEntity.setUser(user);
		refreshTokenEntity.setToken(refreshToken);
		refreshRepo.save(refreshTokenEntity);

		authCookieUtil.setAccessTokenCookie(resp, accessToken);
		authCookieUtil.setRefreshTokenCookie(resp, refreshToken);
	}

	public boolean verifyOtp(UserRequestDTO userRequest) throws IOException {
		String email = userRequest.getEmail();
		String otp = userRequest.getOtp();

		User user = userRepository.findByEmail(email).orElseThrow(() -> new ValidationException("User not found"));

		if (otp != null && otp.equals(user.getOtp())) {
			user.setIsVerified(true);
			saveUser(user);

			if (user.getUserProfile() == null) {
				UserProfile userProfile = new UserProfile();
				userProfile.setName(getUsernameFromEmail(user.getEmail()));
				userProfile.setUser(user);
				userProfileService.saveUserProfileWithRandomImage(userProfile);
			}
			return true;
		}
		return false;
	}

	private String getUsernameFromEmail(String email) {
		if (email == null || !email.contains("@")) {
			return "Love-Link User";
		}
		return email.split("@")[0]; // Returns the part before @
	}

	public void registerUser(UserRequestDTO userRequestDTO) {
		String email = userRequestDTO.getEmail();

		if (email == null || email.trim().isEmpty()) {
			throw new ValidationException("Email cannot be null or empty");
		}

		email = email.trim().toLowerCase();

		// ✅ Check if user already exists
		if (userRepository.findByEmail(email).isPresent()) {
			throw new ValidationException("User already exists with this email");
		}

		User userEntity = new User();
		userEntity.setEmail(email);

		if (email.equalsIgnoreCase(adminEmail)) {
			userEntity.setIsAdmin(true);
		}

		String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
		userEntity.setOtp(otp);
		userEntity.setIsVerified(false);
		userEntity.setPassword(passwordEncoder.encode(userRequestDTO.getPassword()));

		emailService.sendOtpEmail(email, otp);

		saveUser(userEntity);
	}

}