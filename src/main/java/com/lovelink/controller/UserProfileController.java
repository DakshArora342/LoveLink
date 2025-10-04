package com.lovelink.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.lovelink.extra.Constants;
import com.lovelink.extra.ImageUtil;
import com.lovelink.io.UserProfileDTO;
import com.lovelink.io.UserResponseDTO;
import com.lovelink.security.SecurityUtil;
import com.lovelink.service.UserProfileService;
import com.lovelink.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user-profiles")
@RequiredArgsConstructor
public class UserProfileController {

	private final UserProfileService userProfileService;
	private final UserService userService;
	private final ImageUtil imageUtil;
	private final SecurityUtil securityUtil;

	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> createUserProfile(@RequestPart("profile") UserProfileDTO profile,
			@RequestParam("userId") String userId,
			@RequestPart(value = "images", required = false) List<MultipartFile> images) {
		if (userId == null || userId.isEmpty()) {
			return ResponseEntity.badRequest().body("User id not found");
		}

		UserResponseDTO userById = userService.getUserById(userId);
		UserResponseDTO currentUserDto = securityUtil.getCurrentUserDto();

		if (userById != null && currentUserDto != null) {
			if (!userById.getId().equals(currentUserDto.getId())) {
				throw new ResponseStatusException(HttpStatus.FORBIDDEN, Constants.ACCESS_DENIED);
			}
		} else {
			return ResponseEntity.notFound().build();
		}

		if (images != null && !images.isEmpty()) {
			for (MultipartFile image : images) {
				if (image.isEmpty()) {
					return ResponseEntity.badRequest().body("One of the images is empty");
				}
				if (image.getSize() > 5 * 1024 * 1024) { // 5MB max
					return ResponseEntity.badRequest().body("Image size must be less than 5MB");
				}
				String contentType = image.getContentType();
				if (contentType == null || !contentType.matches("image/(jpeg|png)")) {
					return ResponseEntity.badRequest().body("Only JPEG and PNG images are allowed");
				}
			}
		}

		if (profile.getAge() < 18) {
			return ResponseEntity.badRequest().body("Age must be at least 18");
		} else if (profile.getAge() > 100) {
			return ResponseEntity.badRequest().body("Age must be less than 100");
		}

		UserProfileDTO userProfile = userProfileService.getUserProfileByUserId(userId);
		if (userProfile != null) {
			if (userProfile.getGender() != null && profile.getGender() != null
					&& !userProfile.getGender().trim().isEmpty()
					&& !userProfile.getGender().equalsIgnoreCase(profile.getGender().trim())) {
				return ResponseEntity.badRequest().body("Gender cannot be modified.");
			}
			if (userProfile.getPhotos() != null && images != null) {
				if (userProfile.getPhotos().size() + images.size() > 6) {
					return ResponseEntity.badRequest().body("You can upload a maximum of 6 images.");
				}
			}
		}

		List<MultipartFile> compressed = (images != null) ? imageUtil.compressImages(images) : null;
		userProfileService.saveUserProfile(profile, compressed, userById.getId());
		return ResponseEntity.ok("Profile saved successfully");
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> getUserProfile(@PathVariable String id) throws IOException {
		UserResponseDTO userById = userService.getUserById(id);
		UserResponseDTO currentUserDto = securityUtil.getCurrentUserDto();

		if (userById != null && currentUserDto != null) {
			if (!userById.getId().equals(currentUserDto.getId())) {
				throw new ResponseStatusException(HttpStatus.FORBIDDEN, Constants.ACCESS_DENIED);
			}
		} else {
			return ResponseEntity.notFound().build();
		}

		UserProfileDTO userProfile = userProfileService.getUserProfileByUserId(id);
		if (userProfile != null) {
			return ResponseEntity.ok(userProfile);
		}
		return ResponseEntity.notFound().build();
	}

	@DeleteMapping("/image")
	public ResponseEntity<?> deleteUserImage(@RequestBody Map<String, String> payload) {
		String userId = payload.get("userId");
		String imageUrl = payload.get("imageUrl");
		if (userId == null || userId.isEmpty() || imageUrl == null || imageUrl.isEmpty()) {
			return ResponseEntity.badRequest().body("Missing userId or imageUrl");
		}

		UserResponseDTO userById = userService.getUserById(userId);
		UserResponseDTO currentUserDto = securityUtil.getCurrentUserDto();

		if (userById != null && currentUserDto != null) {
			if (!userById.getId().equals(currentUserDto.getId())) {
				throw new ResponseStatusException(HttpStatus.FORBIDDEN, Constants.ACCESS_DENIED);
			}
		} else {
			return ResponseEntity.notFound().build();
		}

		UserProfileDTO userProfile = userProfileService.getUserProfileByUserId(userId);

		if (userProfile != null && userProfile.getPhotos() != null) {
			if (userProfile.getPhotos().size() == 1) {
				return ResponseEntity.badRequest().body("There must be at least one image.");
			}
		}

		boolean deleted = userProfileService.deleteUserImage(userById.getId(), imageUrl);
		if (deleted) {
			return ResponseEntity.ok("Image deleted successfully");
		} else {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete image");
		}
	}

	@GetMapping("/browse")
	public ResponseEntity<?> browseProfiles(@RequestParam(required = false) String lookingForGender,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {

		UserResponseDTO currentUserDto = securityUtil.getCurrentUserDto();

		if (currentUserDto == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
		}

		UserProfileDTO userProfile = userProfileService.getUserProfileByUserId(currentUserDto.getId());
		if (userProfile != null) {
			if (userProfile.getGender() == null || userProfile.getGender().trim().isEmpty()) {
				return ResponseEntity.badRequest().body("Please set your gender in the Profile.");
			}
		}

		Page<UserProfileDTO> profiles = (lookingForGender == null || lookingForGender.isEmpty())
				? userProfileService.findAllProfiles(currentUserDto.getId(), page, size)
				: userProfileService.findByGender(currentUserDto.getId(), lookingForGender.trim(), page, size);

		return ResponseEntity.ok(profiles);
	}

}
