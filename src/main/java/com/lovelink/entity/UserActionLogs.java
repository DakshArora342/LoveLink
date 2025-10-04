package com.lovelink.entity;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import com.lovelink.extra.ActionType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import lombok.Data;

@Entity
@Data
public class UserActionLogs {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private String id;

	// User who performs the action
	@ManyToOne
	private User fromUser;

	// User who receives the action
	@ManyToOne
	private User toUser;

	// Action type: LIKE, NOPE, SUPERLIKE
	@Enumerated(EnumType.STRING)
	private ActionType actionType;

	@Column(updatable = false)
	private LocalDateTime createdAt;

	private boolean isRejected; // Indicates if the action was rejected by the receiver

	private boolean isAccepted;

	@PrePersist
	public void prePersist() {
		// Set createdAt using IST timezone
		this.createdAt = ZonedDateTime.now(ZoneId.of("Asia/Kolkata")).toLocalDateTime();
	}
}
