package com.lovelink.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lovelink.entity.AppSettings;

public interface AppSettingsRepository extends JpaRepository<AppSettings, String> {
}
