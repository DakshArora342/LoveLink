package com.lovelink.controller;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lovelink.io.ChatMessageDTO;
import com.lovelink.service.ChatService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatRestController {

	private final ChatService chatService;

	@GetMapping("/history")
	public Page<ChatMessageDTO> getHistory(@RequestParam String user1, @RequestParam String user2,
			@RequestParam(required = false, defaultValue = "0") int page,
			@RequestParam(required = false, defaultValue = "20") int size) {

		return chatService.getHistory(user1, user2, page, size);
	}
}
