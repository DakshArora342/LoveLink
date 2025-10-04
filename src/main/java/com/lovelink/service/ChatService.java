package com.lovelink.service;

import org.springframework.data.domain.Page;
import org.springframework.messaging.Message;

import com.lovelink.io.ChatMessageDTO;

public interface ChatService {

	void sendMessage(ChatMessageDTO messageDTO, Message<?> stompMessage);

	Page<ChatMessageDTO> getHistory(String user1, String user2, int page, int size);
}
