package com.lovelink.service;

import java.io.IOException;
import java.util.Map;

import com.lovelink.entity.User;
import com.lovelink.io.UserRequestDTO;
import com.lovelink.io.UserResponseDTO;

import jakarta.servlet.http.HttpServletResponse;

public interface UserService {

	UserResponseDTO saveUser(User user);

	UserResponseDTO getUserById(String id);

	UserResponseDTO getUserByEmail(String email);

	boolean verifyPassword(String rawPassword, String email);

	UserResponseDTO resetPassword(Map<String, String> request);

	void generateAndSendOtp(String email);

	void refresh(String rt, HttpServletResponse resp);

	void generateAndSetTokens(HttpServletResponse resp, String email);

	boolean verifyOtp(UserRequestDTO userRequest) throws IOException;

	void registerUser(UserRequestDTO userRequestDTO);

}
