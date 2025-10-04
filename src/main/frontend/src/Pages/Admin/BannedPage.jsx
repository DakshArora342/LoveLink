import { useState } from "react";

export default function BannedPage() {
	const [users, setUsers] = useState([
		{
			id: 1,
			name: "Simran",
			age: 22,
			gender: "female",
			status: "active",
			image: "https://randomuser.me/api/portraits/women/81.jpg",
		},
		{
			id: 2,
			name: "Rohan",
			age: 21,
			gender: "male",
			status: "banned",
			image: "https://randomuser.me/api/portraits/men/75.jpg",
		},
		{
			id: 3,
			name: "Priya",
			age: 23,
			gender: "female",
			status: "banned",
			image: "https://randomuser.me/api/portraits/women/65.jpg",
		},
		{
			id: 4,
			name: "Aman",
			age: 20,
			gender: "male",
			status: "active",
			image: "https://randomuser.me/api/portraits/men/35.jpg",
		},
	]);

	const handleUnban = (id) => {
		setUsers((prev) =>
			prev.map((u) => (u.id === id ? { ...u, status: "active" } : u))
		);
	};

	const bannedUsers = users.filter((u) => u.status === "banned");

	const totalUsers = users.length;
	const bannedCount = bannedUsers.length;
	const maleCount = users.filter((u) => u.gender === "male").length;
	const femaleCount = users.filter((u) => u.gender === "female").length;

	return (
		<div className="max-w-5xl mx-auto h-[calc(100vh-100px)] overflow-y-auto px-4 pb-6">
			<h2 className="text-2xl font-bold mb-6 text-white">Banned Users</h2>

			{/* 📊 Summary */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
				<div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-center">
					<p className="text-sm text-white/60">Total Users</p>
					<p className="text-2xl font-bold text-white">{totalUsers}</p>
				</div>
				<div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-center">
					<p className="text-sm text-white/60">Banned Users</p>
					<p className="text-2xl font-bold text-red-400">{bannedCount}</p>
				</div>
				<div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-center">
					<p className="text-sm text-white/60">👨‍🦰 Male</p>
					<p className="text-2xl font-bold text-blue-400">{maleCount}</p>
				</div>
				<div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-center">
					<p className="text-sm text-white/60">👩‍🦱 Female</p>
					<p className="text-2xl font-bold text-pink-400">{femaleCount}</p>
				</div>
			</div>

			{/* 🚫 Banned List */}
			{bannedUsers.length === 0 ? (
				<p className="text-white/70">No banned users</p>
			) : (
				<div className="space-y-4">
					{bannedUsers.map((user) => (
						<div
							key={user.id}
							className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-center justify-between"
						>
							<div className="flex items-center gap-4">
								<img
									src={user.image}
									alt={user.name}
									className="w-14 h-14 rounded-full object-cover border-2 border-white/30"
								/>
								<div>
									<p className="text-lg font-semibold text-white">
										{user.name}
									</p>
									<p className="text-sm text-white/60">Age: {user.age}</p>
									<p className="text-sm text-white/60 capitalize">
										Gender: {user.gender}
									</p>
								</div>
							</div>
							<button
								onClick={() => handleUnban(user.id)}
								className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-full text-sm transition"
							>
								Unban
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
