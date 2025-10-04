package com.lovelink.service;

public interface AppSettingsService {

	boolean isMaintenanceMode();

	void setMaintenanceMode(boolean enabled);
}
