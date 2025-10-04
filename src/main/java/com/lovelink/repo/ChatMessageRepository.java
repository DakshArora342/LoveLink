package com.lovelink.repo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lovelink.entity.ChatMessage;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {
	Page<ChatMessage> findBySenderIdAndReceiverIdOrReceiverIdAndSenderId(String senderId, String receiverId,
			String receiverId2, String senderId2, Pageable pageable);
}
