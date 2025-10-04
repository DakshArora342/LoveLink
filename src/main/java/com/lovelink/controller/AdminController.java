package com.lovelink.controller;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lovelink.io.UserProfileDTO;
import com.lovelink.security.SecurityUtil;
import com.lovelink.service.AdminService;
import com.lovelink.service.AppSettingsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

	private final AdminService adminService;
	private final SecurityUtil securityUtil;
	private final AppSettingsService appSettingsService;

	@PostMapping("/users/{id}/ban")
	public ResponseEntity<String> banUser(@PathVariable String id) {

		securityUtil.assertCurrentUserIsAdmin();

		adminService.banUser(id);

		return ResponseEntity.ok("User banned");
	}

	@PostMapping("/users/{id}/unban")
	public ResponseEntity<String> unbanUser(@PathVariable String id) {

		securityUtil.assertCurrentUserIsAdmin();

		adminService.unbanUser(id);

		return ResponseEntity.ok("User unbanned");
	}

	@GetMapping("/search")
	public ResponseEntity<Page<UserProfileDTO>> searchProfilesWithFilters(@RequestParam(required = false) String query,
			@RequestParam(required = false) String gender, @RequestParam(required = false) String status,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "8") int size) {

		securityUtil.assertCurrentUserIsAdmin();

		return ResponseEntity.ok(adminService.searchProfilesWithFilters(query, gender, status, page, size));
	}

	@PostMapping("/maintenance")
	public ResponseEntity<Void> toggleMaintenance(@RequestParam boolean enabled) {
		securityUtil.assertCurrentUserIsAdmin();

		appSettingsService.setMaintenanceMode(enabled);

		return ResponseEntity.ok().build();
	}

	@GetMapping("/public/maintenance")
	public ResponseEntity<Map<String, Boolean>> checkMaintenanceMode() {
		return ResponseEntity.ok(Map.of("maintenanceMode", appSettingsService.isMaintenanceMode()));
	}

}