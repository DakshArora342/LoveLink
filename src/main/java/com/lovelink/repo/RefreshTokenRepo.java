package com.lovelink.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.lovelink.entity.RefreshToken;
import com.lovelink.entity.User;

import jakarta.transaction.Transactional;

public interface RefreshTokenRepo extends JpaRepository<RefreshToken, String> {
	Optional<RefreshToken> findByToken(String token);

	void deleteByUser(User user);

	@Modifying
	@Transactional
	@Query("DELETE FROM RefreshToken r WHERE r.id = :id")
	void deleteTokenById(@Param("id") String id);

	// ✅ Deletes all refresh tokens for a given user
	void deleteAllByUser(User user);

}
