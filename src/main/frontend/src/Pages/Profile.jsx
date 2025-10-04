import { useState, useEffect } from "react";
import axiosInstance, { getUser } from "../utils/axios"; // Adjust path if needed

import EditProfileModal from "./EditProfileModal"; // Adjust path if needed
import { motion } from "framer-motion";
import Loading from "../components/Loading";
import logger from "../utils/logger";

export default function Profile() {
	const [userProfile, setUserProfile] = useState(null);
	const [isEditing, setIsEditing] = useState(false);

	const currentUser = getUser(); // User object stored in localStorage
	const userId = currentUser; // Make sure user object has id field

	const fetchProfile = async () => {
		if (!userId) return;

		try {
			const response = await axiosInstance.get(`/user-profiles/${userId}`);
			let profileData = response.data;

			if (typeof profileData.interests === "string") {
				try {
					profileData.interests = JSON.parse(profileData.interests);
				} catch {
					profileData.interests = [];
				}
			}

			setUserProfile(profileData);
		} catch (error) {
			// console.error("Failed to fetch profile:", error);
			logger.error(error);
		}
	};

	useEffect(() => {
		fetchProfile();
	}, [userId]);


	if (!userProfile) {
		return (
			<div className="text-center mt-10 text-white"><Loading></Loading></div>
		);
	}

	return (
		<div className="flex flex-col items-center min-h-screen py-10 px-4 bg-transparent">
			{/* Profile Card */}
			<div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20 relative">
				{/* Feedback Button (inside card but lower) */}
				<motion.a
					href="https://forms.gle/oTTDef1pZKT8Azgu9"
					target="_blank"
					rel="noopener noreferrer"
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.95 }}
					className="fixed top-6 left-6 bg-white/20 backdrop-blur-md border border-white/30 
             text-white px-3 py-1 rounded-full shadow-lg text-xs font-medium 
             hover:bg-white/30 transition-all z-50"
				>
					Feedback
				</motion.a>





				{/* Edit Button */}
				<button
					onClick={() => setIsEditing(true)}
					className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-full text-white"
					aria-label="Edit Profile"
				>
					✏️
				</button>

				{/* Profile Image */}
				<div className="flex justify-center mb-4">
					<img
						src={userProfile?.photos?.[0]?.base64 || "/default-profile.png"}
						alt={userProfile.name || "Profile"}
						className="w-28 h-28 rounded-xl  object-cover"
					/>
				</div>


				{/* Name + Age */}
				<h1 className="text-center text-2xl font-bold text-white">
					{userProfile.name}, {userProfile.age}
				</h1>


				{/* About Me */}
				{userProfile.about && (
					<div className="mt-4 bg-white/20 backdrop-blur-sm text-pink-100 text-sm p-4 rounded-xl">
						<h3 className="font-semibold mb-2">✨ About Me:</h3>
						<p>{userProfile.about}</p>
					</div>
				)}
			</div>

			{/* 🚀 Upcoming Features */}
			<motion.div
				initial={{ opacity: 0, y: 40 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.3 }}
				className="mt-10 w-full max-w-md px-4"
			>
				<div className="text-center mb-4">
					<h3 className="inline-block px-4 py-2 rounded-full text-white text-base font-semibold border border-white/20 backdrop-blur-md bg-white/10 shadow-sm">
						🚀 Upcoming Features
					</h3>
				</div>

				<div className="grid grid-cols-2 gap-4">
					{/* Secret Crush */}
					<div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 flex flex-col items-center text-center text-white">
						<span className="text-lg">💘</span>
						<p className="text-sm font-medium mt-1">Secret Crush</p>
						<span className="text-xs mt-1 text-yellow-300">Coming Soon</span>
					</div>

					{/* Anonymous Texting */}
					<div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 flex flex-col items-center text-center text-white">
						<span className="text-lg">🕵️</span>
						<p className="text-sm font-medium mt-1">Anonymous Texting</p>
						<span className="text-xs mt-1 text-yellow-300">Coming Soon</span>
					</div>

					{/* Confession Board */}
					<div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 flex flex-col items-center text-center text-white col-span-2">
						<span className="text-lg">📃</span>
						<p className="text-sm font-medium mt-1">Confession Board</p>
						<span className="text-xs mt-1 text-yellow-300">Coming Soon</span>
					</div>
				</div>
			</motion.div>

			{/* Edit Modal */}
			{isEditing && (

				<EditProfileModal
					profile={userProfile}
					onClose={() => setIsEditing(false)}
					onSave={() => {
						fetchProfile(); // 🔁 Refetch updated profile
						setIsEditing(false);
					}}
				/>

			)}
		</div>
	);
}
