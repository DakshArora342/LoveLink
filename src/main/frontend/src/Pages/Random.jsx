import { useEffect, useState } from "react";
import profiles from "../data/profiles.json";
import { FaUserCheck, FaHeart, FaTimes } from "react-icons/fa";
import Confetti from "react-confetti";
import { useWindowSize } from "@react-hook/window-size";
import { motion, AnimatePresence } from "framer-motion";
import PixelCard from "../components/PixelCard";
import { useNavigate } from "react-router-dom";
import axiosInstance, { fetchProfile } from "../utils/axios";
import ProfileModal from "../components/ProfileModal";

const tabs = ["Random Match", "Matches Received", "Matches Sent", "Match History"];

export default function Random() {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState(0);
	const [matchData, setMatchData] = useState({ received: [], sent: [], history: [] });
	const [currentUser, setCurrentUser] = useState(null);
	const [message, setMessage] = useState("");
	const [selectedProfile, setSelectedProfile] = useState(null); // ✅ fixed
	const [loading, setLoading] = useState(false);
	const [showConfetti, setShowConfetti] = useState(false);
	const [newRandomMatch, setNewRandomMatch] = useState(null);
	const [showGenderPopup, setShowGenderPopup] = useState(false);
	const [width, height] = useWindowSize();

	// fetch user profile
	useEffect(() => {
		const loadProfile = async () => {
			try {
				const data = await fetchProfile();
				setCurrentUser(data);
				if (!data.gender || !data.gender.trim()) {
					setShowGenderPopup(true);
				} else {
					setShowGenderPopup(false);
				}
			} catch {
				setShowGenderPopup(true);
			} finally {
				setLoading(false);
			}
		};
		loadProfile();
	}, []);

	// fetch matches
	useEffect(() => {
		const fetchMatchData = async () => {
			try {
				setLoading(true);
				const [receivedRes, sentRes, historyRes] = await Promise.all([
					axiosInstance.get("actions/matchReceived"),
					axiosInstance.get("actions/matchSent"),
					axiosInstance.get("actions/randomMatches"),
				]);

				const transformProfile = (p) => ({
					id: p.id,
					name: p.name,
					age: p.age,
					bio: p.about || "",
					confirmed: true,
					images: p.photos?.map((photo) => photo.base64 || photo.url) || [],
				});

				const updated = {
					received: receivedRes.data.content.map(transformProfile),
					sent: sentRes.data.content.map(transformProfile),
					history: historyRes.data.content.map(transformProfile),
				};

				setMatchData(updated);
				localStorage.setItem("matchData", JSON.stringify(updated));
			} catch {
				setMessage("⚠️ Failed to load matches. Please try again.");
			} finally {
				setLoading(false);
			}
		};

		const local = localStorage.getItem("matchData");
		if (local) setMatchData(JSON.parse(local));

		fetchMatchData();
	}, []);

	// make random match
	const makeMatch = async () => {
		setLoading(true);
		setMessage("");
		setNewRandomMatch(null);

		try {
			const res = await axiosInstance.post("/actions/random-match");
			const match = res.data;

			const updated = {
				...matchData,
				sent: [...matchData.sent, { ...match, confirmed: false }],
			};

			setMatchData(updated);
			localStorage.setItem("matchData", JSON.stringify(updated));

			setNewRandomMatch({
				...match,
				images: match.photos?.map((p) => p.base64 || p.url) || [],
			});
			setMessage(`💘 You sent a match to ${match.name}`);
		} catch (err) {
			if (err.response?.status === 404) {
				setMessage("😔 No more matches available.");
			} else if (err.response?.status === 401) {
				setMessage("❌ You must be logged in to match.");
			} else {
				setMessage("⚠️ Something went wrong.");
			}
		} finally {
			setLoading(false);
			setTimeout(() => setNewRandomMatch(null), 6000);
		}
	};

	// confirm/reject
	const confirmMatch = async (id) => {
		try {
			await axiosInstance.post(`/actions/match/${id}/approve`);
			const profile = matchData.received.find((p) => p.id === id);

			const updated = {
				...matchData,
				received: matchData.received.filter((p) => p.id !== id),
				history: [...matchData.history, { ...profile, confirmed: true }],
			};

			setMatchData(updated);
			localStorage.setItem("matchData", JSON.stringify(updated));

			setMessage("✅ Match confirmed! Start chatting now.");
			setShowConfetti(true);
			setTimeout(() => setShowConfetti(false), 3000);
		} catch {
			setMessage("❌ Failed to confirm match.");
		}
	};

	const rejectMatch = async (id) => {
		try {
			await axiosInstance.post(`/actions/match/${id}/reject`);
			const updated = {
				...matchData,
				received: matchData.received.filter((p) => p.id !== id),
			};
			setMatchData(updated);
			localStorage.setItem("matchData", JSON.stringify(updated));
			setMessage("❌ Match declined.");
		} catch {
			setMessage("❌ Failed to reject match.");
		}
	};

	const getData = () => {
		if (activeTab === 1) return matchData.received;
		if (activeTab === 2) return matchData.sent;
		if (activeTab === 3) return matchData.history;
		return [];
	};

	if (showGenderPopup) {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
				<div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
					<h2 className="text-3xl font-bold mb-4 text-gray-900">Gender Not Set</h2>
					<p className="text-gray-700 mb-6">
						Please set your gender in the{" "}
						<span className="font-semibold text-blue-600">Profile</span> tab before
						using Random Match.
					</p>
					<button
						onClick={() => navigate("/profile")}
						className="inline-block bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition"
					>
						Go to Profile
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="relative min-h-screen px-4 pt-20 pb-32 text-white overflow-hidden">
			{showConfetti && <Confetti width={width} height={height} />}

			<h1 className="text-3xl font-bold text-center mb-6">🎲 Random Match</h1>

			{/* Tabs */}
			<div className="flex justify-between gap-2 px-4 mb-6">
				{tabs.map((tab, i) => (
					<button
						key={i}
						onClick={() => {
							setActiveTab(i);
							setMessage("");
							setNewRandomMatch(null);
						}}
						className={`flex-1 h-16 rounded-xl text-sm font-semibold px-2 py-2 transition-all duration-200 border ${activeTab === i
								? "bg-pink-500 text-white border-pink-500 shadow-lg"
								: "bg-white/10 text-white/70 border-white/10 hover:bg-white/20"
							}`}
					>
						{tab === "Matches Received"
							? `${tab} (${matchData.received.length})`
							: tab}
					</button>
				))}
			</div>

			{/* Random Match button */}
			{activeTab === 0 && (
				<div className="text-center mb-6">
					<motion.button
						whileTap={{ scale: 0.92 }}
						whileHover={{ scale: 1.03 }}
						onClick={makeMatch}
						disabled={loading}
						className="bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-semibold py-2 px-6 rounded-full shadow-lg disabled:opacity-50"
					>
						{loading ? "Matching..." : "Make a Random Match"}
					</motion.button>
					{message && <p className="text-sm text-white/80 mt-2">{message}</p>}
				</div>
			)}

			{/* Animated card for new match */}
			<AnimatePresence>
				{newRandomMatch && (
					<motion.div
						key="match-card"
						initial={{ opacity: 0, y: 80, scale: 0.8 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 80, scale: 0.8 }}
						transition={{ duration: 0.5 }}
						className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
					>
						<PixelCard variant="gold" autoReveal className="w-full max-w-xs relative">
							<div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
								<img
									src={newRandomMatch.images?.[0] || ""}
									alt={newRandomMatch.name}
									className="w-24 h-24 rounded-full border-4 border-white object-cover mb-4"
								/>
								<h2 className="text-lg font-bold">
									{newRandomMatch.name}, {newRandomMatch.age}
								</h2>
								<p className="text-white/80 mt-2 text-sm">{newRandomMatch.bio}</p>
								<p className="mt-4 text-green-300 text-sm">
									🎉 You sent a match to {newRandomMatch.name}
								</p>
							</div>
							<button
								onClick={() => setNewRandomMatch(null)}
								className="absolute top-2 right-2 text-white bg-black/40 hover:bg-black/60 p-1 rounded-full"
							>
								✖
							</button>
						</PixelCard>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Match list cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
				{getData().map((user) => (
					<div
						key={user.id}
						className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-4 border border-white/20 shadow-xl cursor-pointer hover:scale-[1.02] transition"
						onClick={() => {
							if (activeTab === 3 && user.confirmed) {
								navigate(`/chat?user=${user.id}`);
							} else if (activeTab !== 1) {
								setSelectedProfile(user);
							}
						}}
					>
						<img
							src={user.images?.[0]}
							alt={user.name}
							className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white/30"
						/>
						<div className="flex-1">
							<h2 className="text-lg font-bold">{user.name}, {user.age}</h2>
							<p className="text-xs text-white/70 mt-1">{user.bio}</p>

							{activeTab === 1 && (
								<div className="mt-2 flex gap-2">
									<motion.button
										whileTap={{ scale: 0.9 }}
										whileHover={{ scale: 1.03 }}
										onClick={() => confirmMatch(user.id)}
										className="bg-white/20 border border-green-400 text-white px-3 py-1 text-xs rounded-full flex items-center gap-1 hover:bg-green-500/60"
									>
										<FaHeart /> Match
									</motion.button>
									<motion.button
										whileTap={{ scale: 0.9 }}
										whileHover={{ scale: 1.03 }}
										onClick={() => rejectMatch(user.id)}
										className="bg-white/20 border border-red-400 text-white px-3 py-1 text-xs rounded-full flex items-center gap-1 hover:bg-red-500/60"
									>
										<FaTimes /> Nope
									</motion.button>
								</div>
							)}

							{activeTab === 3 && user.confirmed && (
								<p
									onClick={() => navigate(`/chat?user=${user.id}`)}
									className="text-green-400 text-xs mt-2 flex items-center gap-1"
								>
									<FaUserCheck /> Chat with {user.name}
								</p>
							)}
						</div>
					</div>
				))}
			</div>

			{/* Profile Modal */}
			{selectedProfile && (
				<ProfileModal
					profile={selectedProfile}
					onClose={() => setSelectedProfile(null)}
				/>
			)}
		</div>
	);
}
