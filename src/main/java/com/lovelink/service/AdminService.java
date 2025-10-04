package com.lovelink.service;

import org.springframework.data.domain.Page;

import com.lovelink.io.UserProfileDTO;

public interface AdminService {

	void banUser(String profileId);

	void unbanUser(String profileId);

	Page<UserProfileDTO> searchProfilesWithFilters(String keyword, String gender, String status, int page, int size);
}
