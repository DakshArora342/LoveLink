package com.lovelink.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lovelink.entity.User;
import com.lovelink.entity.UserAction;

public interface UserActionRepo extends JpaRepository<UserAction, String> {

	Optional<UserAction> findByFromUserAndToUser(User fromUser, User toUser);

}