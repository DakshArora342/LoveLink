package com.lovelink.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.lovelink.entity.User;
import com.lovelink.entity.UserProfile;
import com.lovelink.io.SuperLikedUserDTO;

public interface UserProfileRepository
		extends JpaRepository<UserProfile, String>, JpaSpecificationExecutor<UserProfile> {
	Optional<UserProfile> findByUserId(String userId);

	@Query("""
			    SELECT up
			    FROM UserProfile up
			    WHERE up.user.id != :currentUserId
			    AND NOT EXISTS (
			        SELECT 1
			        FROM UserAction ui
			        WHERE ui.fromUser.id = :currentUserId
			        AND ui.toUser.id = up.user.id
			    )
			""")
	Page<UserProfile> findUnseenProfiles(@Param("currentUserId") String currentUserId, Pageable pageable);

	@Query("""
			    SELECT up
			    FROM UserProfile up
			    WHERE up.user.id != :currentUserId
			    AND NOT EXISTS (
			        SELECT 1
			        FROM UserAction ui
			        WHERE ui.fromUser.id = :currentUserId
			        AND ui.toUser.id = up.user.id
			    )
			    AND up.gender = :targetGender
			""")
	Page<UserProfile> findUnseenProfilesByGender(@Param("currentUserId") String currentUserId,
			@Param("targetGender") String targetGender, Pageable pageable);

	@Query("""
			    SELECT up FROM UserProfile up
			    WHERE up.user.id IN (
			        SELECT ua.fromUser.id FROM UserActionLogs ua
			        WHERE ua.toUser = :currentUser AND ua.actionType IN ('LIKE', 'SUPERLIKE')
			    )
			""")
	Page<UserProfile> findProfilesWhoLikedMe(@Param("currentUser") User currentUser, Pageable pageable);

	@Query("""
			    SELECT up FROM UserProfile up
			    WHERE up.user.id IN (
			        SELECT ua.toUser.id FROM UserActionLogs ua
			        WHERE ua.fromUser = :currentUser AND ua.actionType IN ('LIKE', 'SUPERLIKE')
			    )
			""")
	Page<UserProfile> findProfilesILiked(@Param("currentUser") User currentUser, Pageable pageable);

	@Query(value = """
			SELECT
			    up.user_id AS userId,
			    COUNT(ua.id) AS superlikeCount
			FROM user_action_logs ua
			JOIN user_profiles up ON ua.to_user_id = up.user_id
			WHERE ua.action_type = 'SUPERLIKE'
			GROUP BY up.user_id, up.name, up.about
			ORDER BY superlikeCount DESC
			""", countQuery = """
			    SELECT COUNT(DISTINCT ua.to_user_id)
			    FROM user_action ua
			    WHERE ua.action_type = 'SUPERLIKE'
			""", nativeQuery = true)
	Page<SuperLikedUserDTO> findTopSuperLikedUsers(Pageable pageable);

	@Query("""
			    SELECT up FROM UserProfile up
			    WHERE up.gender <> :gender
			      AND up.user.id <> :currentUserId
			      AND NOT EXISTS (
			          SELECT 1 FROM UserAction ua
			          WHERE (
			              ua.fromUser.id = :currentUserId AND ua.toUser.id = up.user.id
			              AND ua.actionType IN ('NOPE', 'MATCH', 'RANDOM_MATCH', 'REJECT')
			          ) OR (
			              ua.fromUser.id = up.user.id AND ua.toUser.id = :currentUserId
			              AND ua.actionType IN ('NOPE', 'MATCH', 'RANDOM_MATCH', 'REJECT')
			          )
			      )
			""")
	List<UserProfile> findUnseenOppositeGenderProfiles(@Param("currentUserId") String currentUserId,
			@Param("gender") String gender, Pageable pageable);

	@Query("""
			    SELECT up FROM UserProfile up
			    WHERE up.user.id IN (
			        SELECT ua.fromUser.id FROM UserAction ua
			        WHERE ua.toUser = :currentUser AND ua.actionType IN ('RANDOM_MATCH')
			        AND ua.isRejected = false
			        AND ua.isAccepted = false
			    )
			""")
	Page<UserProfile> findProfilesWhoMatchedMe(@Param("currentUser") User currentUser, Pageable pageable);

	@Query("""
			    SELECT up FROM UserProfile up
			    WHERE up.user.id IN (
			        SELECT ua.toUser.id FROM UserActionLogs ua
			        WHERE ua.fromUser = :currentUser AND ua.actionType IN ('RANDOM_MATCH')
			    )
			""")
	Page<UserProfile> findProfilesIMatch(@Param("currentUser") User currentUser, Pageable pageable);

	@Query("""
			    SELECT up FROM UserProfile up
			    WHERE up.user IN (
			        SELECT ua.toUser FROM UserAction ua
			        WHERE ua.fromUser = :currentUser
			        AND ua.actionType = 'RANDOM_MATCH'
			        AND ua.isAccepted = true
			        AND ua.isRejected = false

			        UNION

			        SELECT ua.fromUser FROM UserAction ua
			        WHERE ua.toUser = :currentUser
			        AND ua.actionType = 'RANDOM_MATCH'
			        AND ua.isAccepted = true
			        AND ua.isRejected = false

			        UNION

			        SELECT ua.toUser FROM UserAction ua
			        WHERE ua.fromUser = :currentUser
			        AND ua.actionType = 'MATCH'

			        UNION

			        SELECT ua.fromUser FROM UserAction ua
			        WHERE ua.toUser = :currentUser
			        AND ua.actionType = 'MATCH'
			    )
			""")
	Page<UserProfile> findMatchedProfiles(@Param("currentUser") User currentUser, Pageable pageable);

	@Query("""
			    SELECT up FROM UserProfile up
			    WHERE up.user IN (
			        SELECT ua.toUser FROM UserAction ua
			        WHERE ua.fromUser = :currentUser
			        AND ua.actionType = 'RANDOM_MATCH'
			        AND ua.isAccepted = true
			        AND ua.isRejected = false
			    )
			    OR up.user IN (
			        SELECT ua.fromUser FROM UserAction ua
			        WHERE ua.toUser = :currentUser
			        AND ua.actionType = 'RANDOM_MATCH'
			        AND ua.isAccepted = true
			        AND ua.isRejected = false
			    )
			""")
	Page<UserProfile> findRandomMatches(@Param("currentUser") User currentUser, Pageable pageable);

	@Query("""
			    SELECT up FROM UserProfile up
			    WHERE up.user IN (
			        SELECT ua.toUser FROM UserAction ua
			        WHERE ua.fromUser = :currentUser
			        AND ua.actionType = 'MATCH'
			    )
			    OR up.user IN (
			        SELECT ua.fromUser FROM UserAction ua
			        WHERE ua.toUser = :currentUser
			        AND ua.actionType = 'MATCH'
			    )
			""")
	Page<UserProfile> findConfirmedMatches(@Param("currentUser") User currentUser, Pageable pageable);

	@Query("SELECT p FROM UserProfile p JOIN p.user u " + "WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) "
			+ "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))")
	Page<UserProfile> searchByNameOrEmail(String query, Pageable pageable);

}
