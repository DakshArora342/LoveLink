package com.lovelink.service;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.lovelink.entity.User;
import com.lovelink.entity.UserProfile;
import com.lovelink.extra.ImageUtil;
import com.lovelink.io.UserProfileDTO;
import com.lovelink.repo.UserProfileRepository;
import com.lovelink.repo.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

	private final UserRepository userRepo;
	private final UserProfileRepository userProfileRepo;
	private final ModelMapper modelMapper;
	private final ImageUtil imageUtil;

	@Override
	public void banUser(String profileId) {
		UserProfile userProfile = userProfileRepo.findById(profileId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found"));
		User user = userProfile.getUser();
		user.setIsBanned(true);
		userRepo.save(user);
	}

	@Override
	public void unbanUser(String profileId) {
		UserProfile userProfile = userProfileRepo.findById(profileId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found"));
		User user = userProfile.getUser();
		user.setIsBanned(false);
		userRepo.save(user);
	}

	@Override
	public Page<UserProfileDTO> searchProfilesWithFilters(String keyword, String gender, String status, int page,
			int size) {

		Boolean isBanned = null;
		if ("banned".equalsIgnoreCase(status))
			isBanned = true;
		else if ("active".equalsIgnoreCase(status))
			isBanned = false;

		Pageable pageable = PageRequest.of(page, size);

		Specification<UserProfile> spec = Specification.where(UserProfileSpecification.searchByNameOrEmail(keyword))
				.and(UserProfileSpecification.genderEquals(gender)).and(UserProfileSpecification.isBanned(isBanned))
				.and(UserProfileSpecification.isAdmin(false));
		Page<UserProfile> results = userProfileRepo.findAll(spec, pageable);

		return results.map(profile -> {
			UserProfileDTO resp = modelMapper.map(profile, UserProfileDTO.class);
			resp.setPhotos(imageUtil.imageToBase64(profile.getPhotoUrls()));
			resp.setIsBanned(profile.getUser().getIsBanned());
			resp.setEmail(profile.getUser().getEmail());
			return resp;
		});
	}

}
