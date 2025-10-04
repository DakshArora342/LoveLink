import {
	Routes,
	Route,
	Link,
	useNavigate,
	useLocation,
} from "react-router-dom";
import { useState } from "react";
import {
	FiUsers,
	FiUserX,
	FiFlag,
	FiLogOut,
	FiMenu,
	FiX,
} from "react-icons/fi";

import UsersPage from "./UsersPage";
import NotFound from "../../components/NotFound";

export default function AdminDashboard() {
	const navigate = useNavigate();
	const location = useLocation();
	const [sidebarOpen, setSidebarOpen] = useState(true); // open by default

	const nav = [
		{ name: "Users", icon: <FiUsers />, path: "users" }
	];

	return (
		<div className="min-h-screen flex bg-black text-white relative">

			{/* 🍔 Hamburger (Mobile) */}
			{!sidebarOpen && (
				<button
					onClick={() => setSidebarOpen(true)}
					className="md:hidden absolute top-4 left-4 z-30 text-white"
				>
					<FiMenu size={26} />
				</button>
			)}

			{/* 📚 Sidebar */}
			<aside
				className={`fixed z-20 top-0 left-0 h-full w-64 bg-white/10 backdrop-blur-md border-r border-white/20 p-6 transition-transform duration-300 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
					}`}
			>
				{/* ❌ Close button (mobile + desktop) */}
				<button
					onClick={() => setSidebarOpen(false)}
					className="absolute top-4 right-4 text-white"
				>
					<FiX size={24} />
				</button>

				<h1 className="text-2xl font-bold text-pink-500 mb-6">Admin Panel</h1>
				<nav className="space-y-4">
					{nav.map(({ name, icon, path }) => (
						<Link
							key={name}
							to={`/admin/${path}`}
							onClick={() => setSidebarOpen(false)}
							className={`flex items-center gap-3 text-lg px-3 py-2 rounded-md transition ${location.pathname.includes(path)
								? "text-pink-400 bg-white/10"
								: "text-white/90 hover:text-pink-300"
								}`}
						>
							{icon}
							{name}
						</Link>
					))}
					<button
						onClick={() => navigate("/")}
						className="flex items-center gap-3 text-white/70 hover:text-pink-300 text-lg mt-4"
					>
						<FiLogOut />
						Logout
					</button>
				</nav>
			</aside>

			{/* 🧾 Main Content */}
			<main className="flex-1 overflow-y-auto max-h-screen p-4 md:p-8">
				<Routes>
					<Route path="users" element={<UsersPage />} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</main>
		</div>
	);
}
