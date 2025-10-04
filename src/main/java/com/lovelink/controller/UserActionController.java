package com.lovelink.controller;

import com.lovelink.io.UserProfileDTO;
import com.lovelink.service.UserActionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/actions")
@RequiredArgsConstructor
public class UserActionController {

	private final UserActionService userActionService;

	@PostMapping("/{toUserId}")
	public Map<String, String> swipeAction(@PathVariable String toUserId, @RequestParam String actionType) {
		return userActionService.swipeAction(toUserId, actionType);
	}

	@GetMapping("/received")
	public Page<UserProfileDTO> getProfilesWhoLikedMe(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		return userActionService.getProfilesWhoLikedMe(page, size);
	}

	@GetMapping("/sent")
	public Page<UserProfileDTO> getProfilesILiked(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		return userActionService.getProfilesILiked(page, size);
	}

	@GetMapping("/matches")
	public Page<UserProfileDTO> getProfileMatches(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		return userActionService.getMatchedProfiles(page, size);
	}

	@GetMapping("/randomMatches")
	public Page<UserProfileDTO> getProfileRandomMatches(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		return userActionService.getRandomMatches(page, size);
	}

	@GetMapping("/confirmedMatches")
	public Page<UserProfileDTO> getProfileConfirmedMatches(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		return userActionService.getConfirmedMatches(page, size);
	}

	@GetMapping("/superlikes/top")
	public Page<UserProfileDTO> getTopSuperLikes(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		return userActionService.getTopSuperLikes(page, size);
	}

	@PostMapping("/random-match")
	public UserProfileDTO randomMatch() {
		return userActionService.performRandomMatch();
	}

	@GetMapping("/matchReceived")
	public Page<UserProfileDTO> matchReceived(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		return userActionService.getMatchReceived(page, size);
	}

	@GetMapping("/matchSent")
	public Page<UserProfileDTO> matchSent(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		return userActionService.getMatchSent(page, size);
	}

	@PostMapping("/match/{userProfileId}/approve")
	public Map<String, String> approveMatch(@PathVariable String userProfileId) {
		String result = userActionService.approveMatch(userProfileId);
		return Map.of("message", result);
	}

	@PostMapping("/match/{userProfileId}/reject")
	public Map<String, String> rejectMatch(@PathVariable String userProfileId) {
		String result = userActionService.rejectMatch(userProfileId);
		return Map.of("message", result);
	}
}
