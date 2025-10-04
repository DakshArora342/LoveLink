// src/components/BottomGlassNavbar.jsx
import { NavLink } from "react-router-dom";
import { FaHome, FaUser, FaComments, FaHeart, FaRandom } from "react-icons/fa";
import { GiHeartWings } from "react-icons/gi";
import { useEffect, useState } from "react";
import { fetchUser } from "../utils/axios"
import logger from "../utils/logger";

export default function BottomGlassNavbar() {
	const [isAdmin, setIsAdmin] = useState(false);

	useEffect(() => {
		const loadProfile = async () => {
			try {
				const data = await fetchUser();
				if (data?.isAdmin) {
					setIsAdmin(true);
				}
			} catch (err) {
				logger.error(err);
			} finally {

			}
		};

		loadProfile();
	}, []);


	const navItems = [
		{ to: "/browse", icon: <FaHome />, label: "Browse" },
		{ to: "/random", icon: <FaRandom />, label: "Random" },
		{ to: "/likes", icon: <FaHeart />, label: "Likes" },
		{ to: "/matches", icon: <GiHeartWings size={42} />, label: "Matches" },
		{ to: "/chat", icon: <FaComments />, label: "Chat" },
		{ to: "/profile", icon: <FaUser />, label: "Profile" },
	];

	if (isAdmin) {
		navItems.push({
			to: "/admin/users",
			icon: <span className="text-sm font-bold px-1.5 py-0.5 rounded-full bg-pink-600 text-white">A</span>,
			label: "Admin",
		});
	}

	return (
		<nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-8 py-4 shadow-lg flex gap-6 sm:gap-10 justify-center items-center w-[92%] max-w-md mx-auto">
			{navItems.map((item, i) => (
				<NavLink
					key={i}
					to={item.to}
					className={({ isActive }) =>
						`flex flex-col items-center text-xs transition ${isActive ? "text-pink-600" : "text-white"
						}`
					}
				>
					<div className="text-2xl">{item.icon}</div>
				</NavLink>
			))}
		</nav>
	);
}
