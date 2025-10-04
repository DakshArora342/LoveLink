import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import axiosInstance, { getUser } from "../utils/axios";
import logger from "../utils/logger";

export default function MatchPopup({ visible, user, onClose }) {
	const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });


	const currentUser = getUser(); // User object stored in localStorage
	const userId = currentUser; // Make sure user object has id field
	const [userProfile, setUserProfile] = useState(null);
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
			// console.log(profileData);
		} catch (error) {
			logger.error(error);
			// console.error("Failed to fetch profile:", error);
		}
	};



	useEffect(() => {
		fetchProfile();
		const updateSize = () =>
			setWindowSize({ width: window.innerWidth, height: window.innerHeight });
		updateSize();
		window.addEventListener("resize", updateSize);
		return () => window.removeEventListener("resize", updateSize);
	}, []);

	useEffect(() => {
		if (visible) {
			const timer = setTimeout(onClose, 5000); // auto-close after 5s
			return () => clearTimeout(timer);
		}
	}, [visible, onClose]);

	return (
		<AnimatePresence>
			{visible && (
				<motion.div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					{/* Confetti */}
					<Confetti width={windowSize.width} height={windowSize.height} />

					<motion.div
						className="bg-black/20 backdrop-blur-md rounded-3xl p-6 flex flex-col items-center gap-4 shadow-2xl border border-white/20"
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						exit={{ scale: 0 }}
						transition={{ type: "spring", stiffness: 300, damping: 20 }}
					>
						<h2 className="text-3xl font-bold text-pink-500 drop-shadow-lg">
							💖 It's a Match!
						</h2>
						<p className="text-white text-center">
							You and {user?.name} liked each other!
						</p>
						<div className="flex gap-4 mt-2">
							<img
								src={
									userProfile?.photos?.[0]?.base64 ||
									userProfile?.photos?.[0]?.url ||
									userProfile?.photos?.[0]
								}
								alt="You"
								className="w-24 h-24 rounded-full object-cover border-2 border-pink-500 shadow-lg"
							/>
							<img
								src={
									user?.images?.[0]?.base64 ||
									user?.images?.[0]?.url ||
									user?.images?.[0]
								}
								alt={user?.name}
								className="w-24 h-24 rounded-full object-cover border-2 border-pink-500 shadow-lg"
							/>
						</div>

						<button
							onClick={onClose}
							className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-full shadow-lg hover:bg-pink-600 transition"
						>
							Close
						</button>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
