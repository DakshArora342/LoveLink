package com.lovelink.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class AppSettings {

	@Id
	private String id = "singleton"; // Single row
	private boolean maintenanceMode;

}
