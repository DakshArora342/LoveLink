package com.lovelink.controller;

import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import com.lovelink.io.ChatMessageDTO;
import com.lovelink.service.ChatService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class ChatController {

	private final ChatService chatService;

	@MessageMapping("/send")
	public void sendMessage(@Payload ChatMessageDTO message, Message<?> stompMessage) {
		chatService.sendMessage(message, stompMessage);
	}

}