package com.lovelink.service;

import java.io.IOException;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import com.lovelink.entity.UserProfile;
import com.lovelink.io.UserProfileDTO;

public interface UserProfileService {

	void saveUserProfile(UserProfileDTO profile, List<MultipartFile> images, String userId);

	UserProfileDTO getUserProfileById(String id);

	boolean deleteUserImage(String userId, String imageUrl);

	Page<UserProfileDTO> findByGender(String id, String gender, int page, int size);

	Page<UserProfileDTO> findAllProfiles(String id, int page, int size);

	List<UserProfileDTO> getUnseenMatches(String userId, String gender, int limit);

	int computeMatchScore(UserProfile me, UserProfile other);

	void saveUserProfileWithRandomImage(UserProfile profile) throws IOException;

	UserProfileDTO getUserProfileByUserId(String userId);
}
