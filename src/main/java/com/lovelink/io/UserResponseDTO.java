package com.lovelink.io;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class UserResponseDTO {
	private String id;
	private String email;
	@JsonProperty("isAdmin")
	private boolean isAdmin;
	@JsonProperty("isVerified")
	private boolean isVerified;
	@JsonProperty("isBanned")
	private boolean isBanned;
}
