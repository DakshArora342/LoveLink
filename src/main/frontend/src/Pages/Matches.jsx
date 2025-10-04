import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios"; // Adjust path if needed
import logger from "../utils/logger";


export default function Matches() {
	const [matches, setMatches] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchMatches = async () => {
			try {
				const res = await axiosInstance.get("actions/matches?page=0&size=20");
				const data = res.data.content;

				const transformed = data.map((p) => ({
					id: p.id,
					name: p.name,
					age: p.age,
					bio: p.about || "",
					images: p.photos?.map(photo => photo.base64 || photo.url) || [],
				}));

				setMatches(transformed);
			} catch (error) {
				// console.error("Failed to load matches:", error);
				logger.error(error);
			}
		};

		fetchMatches();
	}, []);


	return (
		<div className="relative min-h-screen px-4 pt-20 pb-32 bg-transparent backdrop-blur-md text-white overflow-hidden">
			{/* Glowing Blobs */}
			<div className="absolute w-72 h-72 bg-pink-300 opacity-20 rounded-full blur-3xl top-0 left-0 animate-pulse" />
			<div className="absolute w-72 h-72 bg-purple-300 opacity-20 rounded-full blur-3xl bottom-0 right-0 animate-pulse" />

			<h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 drop-shadow z-10 relative">
				💘 Your Matches
			</h1>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto z-10 relative">
				{matches.map((user) => (
					<div
						key={user.id}
						onClick={() => navigate(`/chat?user=${user.id}`)}
						className="relative cursor-pointer bg-white/10 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-4 border border-white/20 shadow-xl hover:bg-white/20 transition"
					>
						{/* MATCH STAMP */}
						<div className="absolute top-2 right-2 rotate-[15deg] text-pink-500 text-xs font-extrabold tracking-widest bg-white/20 px-2 py-1 rounded-full border border-pink-400 shadow backdrop-blur-sm opacity-70 pointer-events-none">
							MATCH 💖
						</div>

						<img
							src={user.images?.[0]}
							alt={user.name}
							className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white/30"
						/>
						<div>
							<h2 className="text-lg font-bold text-white drop-shadow">
								{user.name}, {user.age}
							</h2>
							<p className="text-xs text-white/70 mt-1">Tap to start chatting 💬</p>
						</div>
					</div>
				))}
			</div>

			{matches.length === 0 && (
				<p className="text-center text-white/70 mt-10 z-10 relative">
					No matches yet 💔 Keep swiping!
				</p>
			)}
		</div>
	);
}
