//
//import java.time.LocalDateTime;
//import java.util.ArrayList;
//import java.util.List;
//
//import com.fasterxml.jackson.annotation.JsonBackReference;
//
//import jakarta.persistence.CollectionTable;
//import jakarta.persistence.Column;
//import jakarta.persistence.ElementCollection;
//import jakarta.persistence.Entity;
//import jakarta.persistence.GeneratedValue;
//import jakarta.persistence.GenerationType;
//import jakarta.persistence.Id;
//import jakarta.persistence.JoinColumn;
//import jakarta.persistence.OneToOne;
//import jakarta.persistence.PrePersist;
//import jakarta.persistence.PreUpdate;
//import jakarta.persistence.Table;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//@Entity
//@Table(name = "user_profiles")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class UserProfile {
//
//	@Id
//	@GeneratedValue(strategy = GenerationType.UUID)
//	private String id;
//
//	@OneToOne
//	@JoinColumn(name = "user_id", nullable = false)
////	@JsonBackReference
//	private User user; // Reference to the User entity
//
//	private String name;
//
//	private int age; // Age can be stored directly for easier querying
//
//	private String gender;
//
//	// ----- Interests.jsx -----
//	private String communicationStyle; // 📱 Big time texter, etc.
//	private String loveLanguage; // 💬 Compliments, 🕰 Time together
//	private String intellectualTurnOn; // 🧠 Deep conversations
//	private String weekendVibe; // 📺 Chill & Netflix
//
//	// ----- Lifestyle.jsx -----
//	private String relationshipGoal; // 💬 Just friends, 💞 Long-term, etc.
//	private String petPreference; // 🐶 Dog person, 🙅‍♂ Not into pets
//	private String partyStyle; // 🎉 Party animal, 🛋 Chill at home
//	private String zodiacSign; // ♐ Sagittarius, ♑ Capricorn, etc.
//
//	// ----- Photos.jsx -----
//	@ElementCollection
//	@CollectionTable(name = "user_photos", joinColumns = @JoinColumn(name = "user_id"))
//	@Column(name = "photo_url")
//	private List<String> photoUrls = new ArrayList<>();
//
//	private String about;
//
//	private String branch;
//
//	private LocalDateTime updatedAt;
//
//	@PrePersist
//	@PreUpdate
//	public void updateTimestamp() {
//		this.updatedAt = LocalDateTime.now();
//	}
//}
package com.lovelink.entity;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private String id;

	@OneToOne
	@JoinColumn(name = "user_id", nullable = false)
	// @JsonBackReference
	private User user; // Reference to the User entity

	@Column(columnDefinition = "NVARCHAR(255)")
	private String name;

	private int age; // Age can be stored directly for easier querying

	@Column(columnDefinition = "NVARCHAR(255)")
	private String gender;

	// ----- Interests.jsx -----
	@Column(columnDefinition = "NVARCHAR(255)")
	private String communicationStyle; // 📱 Big time texter, etc.

	@Column(columnDefinition = "NVARCHAR(255)")
	private String loveLanguage; // 💬 Compliments, 🕰 Time together

	@Column(columnDefinition = "NVARCHAR(255)")
	private String intellectualTurnOn; // 🧠 Deep conversations

	@Column(columnDefinition = "NVARCHAR(255)")
	private String weekendVibe; // 📺 Chill & Netflix

	// ----- Lifestyle.jsx -----
	@Column(columnDefinition = "NVARCHAR(255)")
	private String relationshipGoal; // 💬 Just friends, 💞 Long-term, etc.

	@Column(columnDefinition = "NVARCHAR(255)")
	private String petPreference; // 🐶 Dog person, 🙅‍♂ Not into pets

	@Column(columnDefinition = "NVARCHAR(255)")
	private String partyStyle; // 🎉 Party animal, 🛋 Chill at home

	@Column(columnDefinition = "NVARCHAR(255)")
	private String zodiacSign; // ♐ Sagittarius, ♑ Capricorn, etc.

	// ----- Photos.jsx -----
	@ElementCollection
	@CollectionTable(name = "user_photos", joinColumns = @JoinColumn(name = "user_id"))
	@Column(name = "photo_url", columnDefinition = "NVARCHAR(2048)")
	private List<String> photoUrls = new ArrayList<>();

	@Column(columnDefinition = "NVARCHAR(MAX)")
	private String about;

	@Column(columnDefinition = "NVARCHAR(255)")
	private String branch;

	private LocalDateTime updatedAt;

	@PrePersist
	@PreUpdate
	public void updateTimestamp() {
		this.updatedAt = ZonedDateTime.now(ZoneId.of("Asia/Kolkata")).toLocalDateTime();
		;
	}
}