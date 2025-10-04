package com.lovelink.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lovelink.entity.User;
import com.lovelink.entity.UserActionLogs;
import com.lovelink.extra.ActionType;

public interface UserActionLogsRepo extends JpaRepository<UserActionLogs, String> {

	Optional<UserActionLogs> findTopByActionTypeAndFromUserOrderByCreatedAtDesc(ActionType actionType, User fromUser);

}