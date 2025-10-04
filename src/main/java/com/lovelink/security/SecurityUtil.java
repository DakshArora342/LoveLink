package com.lovelink.security;

import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import com.lovelink.entity.User;
import com.lovelink.io.UserResponseDTO;
import com.lovelink.repo.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SecurityUtil {

	private final UserRepository userRepository;
	private final ModelMapper modelMapper;

	public User getCurrentUser() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null || !auth.isAuthenticated()) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
		}
		return userRepository.findById(auth.getName())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
	}

	public UserResponseDTO getCurrentUserDto() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null || !auth.isAuthenticated()) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
		}
		User user = userRepository.findById(auth.getName())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
		return modelMapper.map(user, UserResponseDTO.class);
	}

	public boolean isCurrentUserAdmin() {
		return getCurrentUser().getIsAdmin();
	}

	public void assertCurrentUserIsAdmin() {
		if (!isCurrentUserAdmin()) {
			throw new AccessDeniedException("You do not have permission to access this resource");
		}
	}

}
