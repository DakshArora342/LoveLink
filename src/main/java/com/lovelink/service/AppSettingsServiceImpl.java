package com.lovelink.service;

import org.springframework.stereotype.Service;

import com.lovelink.entity.AppSettings;
import com.lovelink.repo.AppSettingsRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AppSettingsServiceImpl implements AppSettingsService {

	private final AppSettingsRepository settingsRepo;

	@Override
	public boolean isMaintenanceMode() {
		return settingsRepo.findById("singleton").map(AppSettings::isMaintenanceMode).orElse(false);
	}

	@Override
	public void setMaintenanceMode(boolean enabled) {
		AppSettings settings = settingsRepo.findById("singleton").orElse(new AppSettings());
		settings.setMaintenanceMode(enabled);
		settingsRepo.save(settings);
	}
}
