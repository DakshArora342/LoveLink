package com.lovelink.service;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.lovelink.entity.User;
import com.lovelink.entity.UserProfile;
import com.lovelink.extra.ImageUtil;
import com.lovelink.io.UserProfileDTO;
import com.lovelink.repo.UserProfileRepository;
import com.lovelink.repo.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserProfileServiceImpl implements UserProfileService {

	private final UserProfileRepository userProfileRepository;
	private final ModelMapper modelMapper;
	private final ImageUtil imageUtil;
	private final UserRepository userRepository;

	@Transactional
	public void saveUserProfile(UserProfileDTO profileDTO, List<MultipartFile> images, String userId) {
		UserProfile profile = modelMapper.map(profileDTO, UserProfile.class);
		User userEntity = userRepository.findById(userId).orElse(null);
		profile.setUser(userEntity);
		List<String> photoUrls;
		if (profile.getPhotoUrls() == null) {
			photoUrls = new ArrayList<>();
		} else {
			photoUrls = profile.getPhotoUrls();
		}

		if (images != null && !images.isEmpty()) {
			for (MultipartFile multipartFile : images) {
				String uploadFile = uploadFile(multipartFile);
				if (uploadFile != null && !uploadFile.isEmpty()) {
					photoUrls.add(uploadFile);
				}
			}
		}

		Optional<UserProfile> userProfile = userProfileRepository.findByUserId(profile.getUser().getId());

		if (userProfile.isPresent()) {
			List<String> photoUrls2 = userProfile.get().getPhotoUrls();
			if (photoUrls2 != null && !photoUrls2.isEmpty()) {
				// If the user already has a profile, append new photo URLs to existing ones
				photoUrls2.addAll(photoUrls);
				profile.setPhotoUrls(photoUrls2);
			}
			// If the user already has a profile, update it instead of creating a new one
			profile.setId(userProfile.get().getId());
		} else {
			// If no profile exists, create a new one
			User user = profile.getUser();
			profile.setPhotoUrls(photoUrls);

			user.setUserProfile(profile);// Associate the profile with the user
			profile.setUser(user); // Ensure ID is null for new profile creation
		}
		userProfileRepository.save(profile);
	}

	public UserProfileDTO getUserProfileById(String id) {
		Optional<UserProfile> optional = userProfileRepository.findById(id);
		if (optional.isEmpty()) {
			return null;
		}
		return modelMapper.map(optional.get(), UserProfileDTO.class);
	}

	public UserProfileDTO getUserProfileByUserId(String userId) {
		Optional<UserProfile> optional = userProfileRepository.findByUserId(userId);
		if (optional.isEmpty()) {
			return null;
		}
		UserProfileDTO userProfileDTO = modelMapper.map(optional.get(), UserProfileDTO.class);
		List<String> photoUrls = optional.get().getPhotoUrls();
		userProfileDTO.setPhotos(imageUtil.imageToBase64(photoUrls));
		return userProfileDTO;
	}

	private String uploadFile(MultipartFile file) {
		String uploadDir = "/home/uploads"; // Updated for Azure
		File uploadPath = new File(uploadDir);

		// Create directory if it doesn't exist
		if (!uploadPath.exists()) {
			uploadPath.mkdirs();
		}

		// Get original filename and extension
		String originalFilename = file.getOriginalFilename();
		String extension = "";

		String baseName = Paths.get(originalFilename).getFileName().toString();
		if (baseName.contains("..")) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid path");
		}

		if (originalFilename != null && originalFilename.contains(".")) {
			extension = originalFilename.substring(originalFilename.lastIndexOf("."));
		}

		// Create unique filename
		String uniqueFilename = UUID.randomUUID().toString() + extension;

		// Build file path
		String filePath = uploadPath.getAbsolutePath() + File.separator + uniqueFilename;

		try {
			// Save the file
			file.transferTo(new File(filePath));
			return filePath;
		} catch (IOException e) {
			log.error("File upload failed", e);
			return null;
		}
	}

	private boolean deleteFile(String absolutePath) {
		File file = new File(absolutePath);

		if (file.exists() && file.isFile()) {
			return file.delete();
		}

		return false;
	}

	@Transactional
	public boolean deleteUserImage(String userId, String imageUrl) {
		Optional<UserProfile> profileOpt = userProfileRepository.findByUserId(userId);

		if (profileOpt.isEmpty()) {
			return false;
		}

		// Sanitize the incoming image URL
		String relativePath = imageUrl.startsWith("/") ? imageUrl.substring(1) : imageUrl;

		// Base uploads directory
		Path baseDir = Paths.get("/home/uploads").toAbsolutePath().normalize();
		Path fullImagePath = baseDir.resolve(Paths.get(relativePath).getFileName()).normalize();

		// Ensure the file is within the /home/uploads directory (security check)
		if (!fullImagePath.startsWith(baseDir)) {
			throw new SecurityException("Invalid image path: Potential directory traversal detected.");
		}

		String fullImagePathStr = fullImagePath.toString();

		UserProfile profile = profileOpt.get();
		List<String> photoUrls = profile.getPhotoUrls();

		if (photoUrls == null || !photoUrls.contains(fullImagePathStr)) {
			return false; // image path not found in profile
		}

		// Do not allow deletion if only one image remains
		if (photoUrls.size() <= 1) {
			throw new IllegalStateException("Cannot delete the only remaining image.");
		}

		// Attempt to delete the file
		boolean deleted = deleteFile(fullImagePathStr);
		if (!deleted) {
			return false;
		}

		// Remove image reference from profile and save
		photoUrls.remove(fullImagePathStr);
		profile.setPhotoUrls(photoUrls);
		userProfileRepository.save(profile);

		return true;
	}

	public Page<UserProfileDTO> findByGender(String id, String gender, int page, int size) {
		Pageable pageable = PageRequest.of(page, size);
		Page<UserProfile> unseenProfilesByGender = userProfileRepository.findUnseenProfilesByGender(id, gender,
				pageable);
		return unseenProfilesByGender.map(profile -> {
			UserProfileDTO userProfileDTO = modelMapper.map(profile, UserProfileDTO.class);
			userProfileDTO.setPhotos(imageUtil.imageToBase64(profile.getPhotoUrls()));
			return userProfileDTO;
		});
	}

	public Page<UserProfileDTO> findAllProfiles(String id, int page, int size) {
		Pageable pageable = PageRequest.of(page, size);
		Page<UserProfile> unseenProfilesByGender = userProfileRepository.findUnseenProfiles(id, pageable);
		return unseenProfilesByGender.map(profile -> {
			UserProfileDTO userProfileDTO = modelMapper.map(profile, UserProfileDTO.class);
			userProfileDTO.setPhotos(imageUtil.imageToBase64(profile.getPhotoUrls()));
			return userProfileDTO;
		});
	}

	public List<UserProfileDTO> getUnseenMatches(String userId, String gender, int limit) {
		Pageable pageable = PageRequest.of(0, limit);
		return userProfileRepository.findUnseenOppositeGenderProfiles(userId, gender, pageable).stream()
				.map(profile -> {
					UserProfileDTO userProfileDTO = modelMapper.map(profile, UserProfileDTO.class);
					userProfileDTO.setPhotos(imageUtil.imageToBase64(profile.getPhotoUrls()));
					return userProfileDTO;
				}).toList();
	}

	public int computeMatchScore(UserProfile me, UserProfile other) {
		int score = 0;

		score += safeMatchScore(me.getPetPreference(), other.getPetPreference(), 3);
		score += safeMatchScore(me.getWeekendVibe(), other.getWeekendVibe(), 2);
		score += safeMatchScore(me.getLoveLanguage(), other.getLoveLanguage(), 3);
		score += safeMatchScore(me.getZodiacSign(), other.getZodiacSign(), 1);
		score += safeMatchScore(me.getCommunicationStyle(), other.getCommunicationStyle(), 2);
		score += safeMatchScore(me.getIntellectualTurnOn(), other.getIntellectualTurnOn(), 2);
		score += safeMatchScore(me.getRelationshipGoal(), other.getRelationshipGoal(), 3);
		score += safeMatchScore(me.getPartyStyle(), other.getPartyStyle(), 1);
		score += safeMatchScore(me.getBranch(), other.getBranch(), 1);
		score += safeMatchScore(me.getGender(), other.getGender(), 1);
		score += ageScore(me.getAge(), other.getAge());
		// Add other attribute comparisons if needed

		return score;
	}

	private int safeMatchScore(String a, String b, int weight) {
		if (a == null || b == null)
			return 0;
		return a.equalsIgnoreCase(b) ? weight : 0;
	}

	private int ageScore(int age1, int age2) {
		int diff = Math.abs(age1 - age2);
		if (diff <= 2)
			return 3;
		if (diff <= 5)
			return 1;
		return 0;
	}

	public void saveUserProfileWithRandomImage(UserProfile profile) throws IOException {
		File randomImage = getRandomImageFromFolder();

		MultipartFile multipartFile = fileToMultipartFile(randomImage);

		List<MultipartFile> files = new ArrayList<>();
		files.add(multipartFile);

		saveUserProfile(modelMapper.map(profile, UserProfileDTO.class), files, profile.getUser().getId());
	}

	private File getRandomImageFromFolder() throws IOException {
		ClassLoader classLoader = getClass().getClassLoader();

		List<String> imageNames = List.of("1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg"); // list your default images

		String selectedImage = imageNames.get(new Random().nextInt(imageNames.size()));

		// Load resource as stream
		InputStream inputStream = classLoader.getResourceAsStream("images/" + selectedImage);

		if (inputStream == null) {
			throw new FileNotFoundException("Image not found in resources: " + selectedImage);
		}

		// Create a temporary file to pass as File
		File tempFile = File.createTempFile("default_", "_" + selectedImage);
		Files.copy(inputStream, tempFile.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);

		return tempFile;
	}

	private MultipartFile fileToMultipartFile(File file) throws IOException {
		FileInputStream input = new FileInputStream(file);
		MultipartFile multipartFile = new MockMultipartFile(file.getName(), file.getName(),
				Files.probeContentType(file.toPath()), input);
		input.close();
		return multipartFile;
	}

}