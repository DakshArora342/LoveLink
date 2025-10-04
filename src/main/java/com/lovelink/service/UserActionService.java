package com.lovelink.service;

import java.util.Map;

import org.springframework.data.domain.Page;

import com.lovelink.io.UserProfileDTO;

public interface UserActionService {

	Map<String, String> swipeAction(String toUserId, String actionType);

	Page<UserProfileDTO> getProfilesWhoLikedMe(int page, int size);

	Page<UserProfileDTO> getProfilesILiked(int page, int size);

	Page<UserProfileDTO> getMatchedProfiles(int page, int size);

	Page<UserProfileDTO> getRandomMatches(int page, int size);

	Page<UserProfileDTO> getConfirmedMatches(int page, int size);

	Page<UserProfileDTO> getTopSuperLikes(int page, int size);

	UserProfileDTO performRandomMatch();

	Page<UserProfileDTO> getMatchReceived(int page, int size);

	Page<UserProfileDTO> getMatchSent(int page, int size);

	String approveMatch(String userProfileId);

	String rejectMatch(String userProfileId);
}
