package com.lovelink.extra;

import java.time.LocalDateTime;
import java.time.ZoneId;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.lovelink.repo.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UnverifiedUserCleanupTask {

	private final UserRepository userRepository;

	@Transactional
	@Scheduled(fixedDelay = 15 * 60 * 1000) // Fixed delay (milliseconds)
	public void cleanUnverifiedUsers() {
		// Cutoff time: 15 minutes ago in IST
		LocalDateTime cutoffTime = LocalDateTime.now(ZoneId.of("Asia/Kolkata")).minusMinutes(15);
		userRepository.deleteUnverifiedUsersOlderThan(cutoffTime);
	}
}
