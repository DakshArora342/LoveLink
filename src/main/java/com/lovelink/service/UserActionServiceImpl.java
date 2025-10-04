package com.lovelink.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.lovelink.entity.User;
import com.lovelink.entity.UserAction;
import com.lovelink.entity.UserActionLogs;
import com.lovelink.entity.UserProfile;
import com.lovelink.extra.ActionType;
import com.lovelink.extra.ImageUtil;
import com.lovelink.io.SuperLikedUserDTO;
import com.lovelink.io.UserProfileDTO;
import com.lovelink.repo.UserActionLogsRepo;
import com.lovelink.repo.UserActionRepo;
import com.lovelink.repo.UserProfileRepository;
import com.lovelink.repo.UserRepository;
import com.lovelink.security.SecurityUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserActionServiceImpl implements UserActionService {

	private final UserActionRepo userActionRepo;
	private final UserActionLogsRepo userActionLogsRepo;
	private final UserProfileService userProfileService;
	private final UserProfileRepository userProfileRepo;
	private final ModelMapper modelMapper;
	private final ImageUtil imageUtil;
	private final SecurityUtil securityUtil;
	private final UserRepository userRepository;

	@Value("${lovelink.randommatch.timeout.days}")
	private long timeoutDays;

	private boolean hasTimedOut(UserActionLogs userAction, long timeoutDays) {
		LocalDateTime createdAt = userAction.getCreatedAt();
		LocalDateTime now = LocalDateTime.now();
		return ChronoUnit.DAYS.between(createdAt, now) >= timeoutDays;
	}

	@Override
	public Map<String, String> swipeAction(String toUserId, String actionType) {
		User fromUser = securityUtil.getCurrentUser();

		User toUser = userProfileRepo.findById(toUserId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found"))
				.getUser();

		ActionType currentAction = ActionType.valueOf(actionType.toUpperCase());

		Optional<UserAction> reciprocalAction = userActionRepo.findByFromUserAndToUser(toUser, fromUser);
		boolean isMutual = reciprocalAction.isPresent()
				&& List.of(ActionType.LIKE, ActionType.SUPERLIKE, ActionType.RANDOM_MATCH)
						.contains(reciprocalAction.get().getActionType())
				&& List.of(ActionType.LIKE, ActionType.SUPERLIKE).contains(currentAction);

		Optional<UserAction> existing = userActionRepo.findByFromUserAndToUser(fromUser, toUser);
		UserAction action = existing.orElseGet(UserAction::new);
		action.setFromUser(fromUser);
		action.setToUser(toUser);
		action.setActionType(isMutual ? ActionType.MATCH : currentAction);
		userActionRepo.save(action);

		UserActionLogs newLog = new UserActionLogs();
		newLog.setFromUser(fromUser);
		newLog.setToUser(toUser);
		newLog.setActionType(currentAction);
		userActionLogsRepo.save(newLog);

		if (isMutual) {
			UserAction reciprocal = reciprocalAction.get();
			reciprocal.setActionType(ActionType.MATCH);
			userActionRepo.save(reciprocal);

			UserActionLogs matchLog = new UserActionLogs();
			matchLog.setFromUser(toUser);
			matchLog.setToUser(fromUser);
			matchLog.setActionType(ActionType.MATCH);
			userActionLogsRepo.save(matchLog);

			return Map.of("message", "🎉 It's a match!");
		}

		return Map.of("message", "Action recorded");
	}

	private Page<UserProfileDTO> mapUserProfiles(Page<UserProfile> profiles) {
		return profiles.map(profile -> {
			UserProfileDTO dto = modelMapper.map(profile, UserProfileDTO.class);
			dto.setPhotos(imageUtil.imageToBase64(profile.getPhotoUrls()));
			return dto;
		});
	}

	@Override
	public Page<UserProfileDTO> getProfilesWhoLikedMe(int page, int size) {
		Pageable pageable = PageRequest.of(page, size);
		return mapUserProfiles(userProfileRepo.findProfilesWhoLikedMe(securityUtil.getCurrentUser(), pageable));
	}

	@Override
	public Page<UserProfileDTO> getProfilesILiked(int page, int size) {
		Pageable pageable = PageRequest.of(page, size);
		return mapUserProfiles(userProfileRepo.findProfilesILiked(securityUtil.getCurrentUser(), pageable));
	}

	@Override
	public Page<UserProfileDTO> getMatchedProfiles(int page, int size) {
		Pageable pageable = PageRequest.of(page, size);
		return mapUserProfiles(userProfileRepo.findMatchedProfiles(securityUtil.getCurrentUser(), pageable));
	}

	@Override
	public Page<UserProfileDTO> getRandomMatches(int page, int size) {
		Pageable pageable = PageRequest.of(page, size);
		return mapUserProfiles(userProfileRepo.findRandomMatches(securityUtil.getCurrentUser(), pageable));
	}

	@Override
	public Page<UserProfileDTO> getConfirmedMatches(int page, int size) {
		Pageable pageable = PageRequest.of(page, size);
		return mapUserProfiles(userProfileRepo.findConfirmedMatches(securityUtil.getCurrentUser(), pageable));
	}

	@Override
	public Page<UserProfileDTO> getTopSuperLikes(int page, int size) {
		Pageable pageable = PageRequest.of(page, size);
		Page<SuperLikedUserDTO> topUsers = userProfileRepo.findTopSuperLikedUsers(pageable);

		return topUsers.map(dto -> {
			User user = userRepository.findById(dto.getUserId())
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
			UserProfile profile = user.getUserProfile();
			UserProfileDTO response = modelMapper.map(profile, UserProfileDTO.class);
			response.setSuperlikeCount(dto.getSuperlikeCount());
			response.setPhotos(imageUtil.imageToBase64(profile.getPhotoUrls()));
			return response;
		});
	}

	@Override
	public UserProfileDTO performRandomMatch() {
		User currentUser = securityUtil.getCurrentUser();
		UserProfile myProfile = currentUser.getUserProfile();

		if (myProfile == null || myProfile.getGender() == null || myProfile.getGender().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please set your gender in the profile.");
		}

		Optional<UserActionLogs> latest = userActionLogsRepo
				.findTopByActionTypeAndFromUserOrderByCreatedAtDesc(ActionType.RANDOM_MATCH, currentUser);
		if (latest.isPresent() && !hasTimedOut(latest.get(), timeoutDays)) {
			throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
					"Please wait "+ timeoutDays + " days before requesting another random match.");
		}

		Pageable pageable = PageRequest.of(0, 50);
		List<UserProfile> pool = userProfileRepo.findUnseenOppositeGenderProfiles(currentUser.getId(),
				myProfile.getGender(), pageable);
		if (pool.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No new matches available");
		}

		List<UserProfile> topMatches = pool.stream()
				.map(p -> Map.entry(p, userProfileService.computeMatchScore(myProfile, p)))
				.sorted((a, b) -> Integer.compare(b.getValue(), a.getValue())).limit(10).map(Map.Entry::getKey)
				.toList();

		UserProfile selected = topMatches.get(new Random().nextInt(topMatches.size()));

		UserAction action = userActionRepo.findByFromUserAndToUser(currentUser, selected.getUser())
				.orElse(new UserAction());
		action.setFromUser(currentUser);
		action.setToUser(selected.getUser());
		action.setActionType(ActionType.RANDOM_MATCH);
		userActionRepo.save(action);

		UserActionLogs log = new UserActionLogs();
		log.setFromUser(currentUser);
		log.setToUser(selected.getUser());
		log.setActionType(ActionType.RANDOM_MATCH);
		userActionLogsRepo.save(log);

		UserProfileDTO response = modelMapper.map(selected, UserProfileDTO.class);
		response.setPhotos(imageUtil.imageToBase64(selected.getPhotoUrls()));

		return response;
	}

	@Override
	public Page<UserProfileDTO> getMatchReceived(int page, int size) {
		Pageable pageable = PageRequest.of(page, size);
		return mapUserProfiles(userProfileRepo.findProfilesWhoMatchedMe(securityUtil.getCurrentUser(), pageable));
	}

	@Override
	public Page<UserProfileDTO> getMatchSent(int page, int size) {
		Pageable pageable = PageRequest.of(page, size);
		return mapUserProfiles(userProfileRepo.findProfilesIMatch(securityUtil.getCurrentUser(), pageable));
	}

	@Override
	public String approveMatch(String userProfileId) {
		User currentUser = securityUtil.getCurrentUser();
		User otherUser = userProfileRepo.findById(userProfileId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)).getUser();

		Optional<UserAction> action = userActionRepo.findByFromUserAndToUser(otherUser, currentUser);
		if (action.isEmpty() || action.get().getActionType() != ActionType.RANDOM_MATCH) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No match request found.");
		}

		action.get().setAccepted(true);
		userActionRepo.save(action.get());
		return "✅ Match confirmed!";
	}

	@Override
	public String rejectMatch(String userProfileId) {
		User currentUser = securityUtil.getCurrentUser();
		User otherUser = userProfileRepo.findById(userProfileId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)).getUser();

		Optional<UserAction> action = userActionRepo.findByFromUserAndToUser(otherUser, currentUser);
		if (action.isEmpty() || action.get().getActionType() != ActionType.RANDOM_MATCH) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No match request found.");
		}

		action.get().setRejected(true);
		userActionRepo.save(action.get());
		return "❌ Match rejected";
	}
}
