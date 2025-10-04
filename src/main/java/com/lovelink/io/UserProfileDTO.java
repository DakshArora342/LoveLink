package com.lovelink.io;

import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserProfileDTO {
	private String id;
	private String name;
	private String email;
	private int age;
	private String gender;
	private String communicationStyle;
	private String loveLanguage;
	private String intellectualTurnOn;
	private String weekendVibe;
	private String relationshipGoal;
	private String petPreference;
	private String partyStyle;
	private String zodiacSign;
	private String about;
	private String branch;

	private List<PhotoResponse> photos;

	private long superlikeCount;

	private Boolean isBanned = false;
}
