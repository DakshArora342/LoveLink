package com.lovelink.service;

import java.util.Optional;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.lovelink.entity.ChatMessage;
import com.lovelink.entity.User;
import com.lovelink.entity.UserProfile;
import com.lovelink.extra.Constants;
import com.lovelink.io.ChatMessageDTO;
import com.lovelink.repo.ChatMessageRepository;
import com.lovelink.repo.UserProfileRepository;
import com.lovelink.security.SecurityUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

	private final SimpMessagingTemplate messagingTemplate;
	private final ChatMessageRepository chatRepo;
	private final ModelMapper modelMapper;
	private final SecurityUtil securityUtil;
	private final UserProfileRepository userProfileRepository;

	public void sendMessage(ChatMessageDTO messageDTO, Message<?> stompMessage) {

		ChatMessage message = modelMapper.map(messageDTO, ChatMessage.class);

		StompHeaderAccessor accessor = StompHeaderAccessor.wrap(stompMessage);

		String currentUserId = (String) accessor.getSessionAttributes().get("userId");

		if (currentUserId == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
		}

		if (!message.getSenderId().equals(currentUserId)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot send messages as another user");
		}

		Optional<UserProfile> targetProfile = userProfileRepository.findById(message.getReceiverId());
		if (targetProfile.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found");
		}

		User toUser = targetProfile.get().getUser();
		message.setReceiverId(toUser.getId());

		ChatMessage save = chatRepo.save(message);
		messagingTemplate.convertAndSend("/topic/" + message.getReceiverId(), save);

	}

	@Override
	public Page<ChatMessageDTO> getHistory(String user1, String user2, int page, int size) {
		User currentUser = securityUtil.getCurrentUser();

		if (!currentUser.getId().equals(user1) && !currentUser.getId().equals(user2)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, Constants.ACCESS_DENIED);
		}

		Optional<UserProfile> targetProfile = userProfileRepository.findById(user2);
		if (targetProfile.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found");
		}

		User toUser = targetProfile.get().getUser();
		user2 = (toUser.getId());

		Page<ChatMessage> chatMessages = chatRepo.findBySenderIdAndReceiverIdOrReceiverIdAndSenderId(user1, user2,
				user1, user2, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp")));

		return chatMessages.map(msg -> modelMapper.map(msg, ChatMessageDTO.class));
	}

}
