package com.lovelink.io;

import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserRequestDTO {
	@Column(nullable = false, unique = true)
	@NotBlank(message = "Email is required")
	@Email(message = "Invalid email format")
	private String email;
	private String password;
	private String otp;

}
