package com.lovelink.entity;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private String id;

	private String senderId;
	private String receiverId;
	private String content;
	private LocalDateTime timestamp;

	@PrePersist
	public void prePersist() {
		timestamp = ZonedDateTime.now(ZoneId.of("Asia/Kolkata")).toLocalDateTime();
	}
}
