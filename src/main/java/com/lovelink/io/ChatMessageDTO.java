package com.lovelink.io;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {

	private String id;
	private String senderId;
	private String receiverId;
	private String content;
	private LocalDateTime timestamp;

}
