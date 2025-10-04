// UserProfileSpecification.java
package com.lovelink.service;

import org.springframework.data.jpa.domain.Specification;

import com.lovelink.entity.UserProfile;

import jakarta.persistence.criteria.Predicate;

public class UserProfileSpecification {

	public static Specification<UserProfile> searchByNameOrEmail(String keyword) {
		return (root, query, cb) -> {
			if (keyword == null || keyword.isBlank())
				return null;

			// Join with User entity to access email
			var userJoin = root.join("user");

			Predicate namePredicate = cb.like(cb.lower(root.get("name")), "%" + keyword.toLowerCase() + "%");
			Predicate emailPredicate = cb.like(cb.lower(userJoin.get("email")), "%" + keyword.toLowerCase() + "%");

			return cb.or(namePredicate, emailPredicate);
		};
	}

	public static Specification<UserProfile> isBanned(Boolean isBanned) {
		return (root, query, cb) -> {
			if (isBanned == null)
				return null;
			return cb.equal(root.get("user").get("isBanned"), isBanned);
		};
	}

	public static Specification<UserProfile> isAdmin(Boolean isAdmin) {
		return (root, query, cb) -> {
			if (isAdmin == null)
				return null;
			return cb.equal(root.get("user").get("isAdmin"), isAdmin);
		};
	}

	public static Specification<UserProfile> genderEquals(String gender) {
		return (root, query, cb) -> {
			if (gender == null || gender.isBlank())
				return null;
			return cb.equal(cb.lower(root.get("gender")), gender.toLowerCase());
		};
	}
}
