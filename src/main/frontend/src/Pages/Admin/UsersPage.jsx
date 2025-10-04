import { useState, useEffect, useCallback } from "react";
import { fetchUsersWithSearch, banUser, unbanUser } from "../../api/admin";
import Loading from "../../components/Loading";
import MaintenanceToggle from "../../components/MaintenanceToggle";
import logger from "../../utils/logger";

const ITEMS_PER_PAGE = 8;

export default function UsersPage() {
	const [users, setUsers] = useState([]);
	const [page, setPage] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState("name");
	const [filterStatus, setFilterStatus] = useState("all");
	const [filterGender, setFilterGender] = useState("all");

	const [debouncedSearch, setDebouncedSearch] = useState(search);
	const [totals, setTotals] = useState({
		totalUsers: 0,
		banned: 0,
		male: 0,
		female: 0
	});

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearch(search);
		}, 500);
		return () => clearTimeout(handler);
	}, [search]);

	const loadUsers = useCallback(async () => {
		setLoading(true);
		try {
			const data = await fetchUsersWithSearch({
				query: debouncedSearch,
				gender: filterGender,
				status: filterStatus,
				page,
				size: ITEMS_PER_PAGE
			});

			let userList = [...data.content];

			// Optional client-side sort
			userList.sort((a, b) => {
				if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
				if (sortBy === "age") return a.age - b.age;
				if (sortBy === "status") return (a.isBanned ? 1 : 0) - (b.isBanned ? 1 : 0);
				return 0;
			});

			setUsers(userList);
			setTotalPages(data.totalPages || 1);

			// Update totals from the API (or calculate from content if API returns full counts)
			const totalUsers = data.totalElements || data.totalUsers || userList.length;
			const bannedCount = data.totalBanned ?? userList.filter(u => u.isBanned).length;
			const maleCount = userList.filter(u => u.gender === "Male").length;
			const femaleCount = userList.filter(u => u.gender === "Female").length;

			setTotals({
				totalUsers,
				banned: bannedCount,
				male: maleCount,
				female: femaleCount
			});

		} catch (err) {
			setUsers([]);
			setTotals({ totalUsers: 0, banned: 0, male: 0, female: 0 });
		} finally {
			setLoading(false);
		}
	}, [debouncedSearch, filterGender, filterStatus, page, sortBy]);

	useEffect(() => {
		loadUsers();
	}, [loadUsers]);

	const handleBan = async (user) => {
		try {
			await banUser(user.id);
			loadUsers();
		} catch (err) {
			logger.error(err);
		 }
	};

	const handleUnban = async (user) => {
		try {
			await unbanUser(user.id);
			loadUsers();
		} catch (err) {
			logger.error(err);
		 }
	};

	return (
		<div className="max-w-4xl mx-auto px-4 py-8">
			<h2 className="text-3xl font-bold mb-6 text-white">All Users</h2>

			<MaintenanceToggle />

			{/* Summary Cards */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
				{[
					{ label: "Total Users", value: totals.totalUsers },
					/*{ label: "Banned", value: totals.banned },
					{ label: "Males", value: totals.male },
					{ label: "Females", value: totals.female }*/
				].map((item, i) => (
					<div key={i} className="bg-white/10 text-white p-4 rounded-xl text-center">
						<p className="text-xl font-semibold">{item.value}</p>
						<p className="text-sm text-white/60">{item.label}</p>
					</div>
				))}
			</div>

			{/* Filters */}
			<div className="flex flex-wrap gap-4 mb-6">
				<input
					type="text"
					placeholder="Search by name"
					className="bg-white/10 text-white px-3 py-1 rounded-lg outline-none placeholder:text-white/50"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				<select
					value={filterStatus}
					onChange={(e) => setFilterStatus(e.target.value)}
					className="bg-gray-900 text-white px-3 py-1 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500"
				>
					<option className="bg-gray-900 text-white" value="all">All Status</option>
					<option className="bg-gray-900 text-white" value="active">Active</option>
					<option className="bg-gray-900 text-white" value="banned">Banned</option>
				</select>

				<select
					value={filterGender}
					onChange={(e) => setFilterGender(e.target.value)}
					className="bg-gray-900 text-white px-3 py-1 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500"
				>
					<option className="bg-gray-900 text-white" value="all">All Genders</option>
					<option className="bg-gray-900 text-white" value="Male">Male</option>
					<option className="bg-gray-900 text-white" value="Female">Female</option>
				</select>

				<select
					value={sortBy}
					onChange={(e) => setSortBy(e.target.value)}
					className="bg-gray-900 text-white px-3 py-1 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500"
				>
					<option className="bg-gray-900 text-white" value="name">Sort by Name</option>
					<option className="bg-gray-900 text-white" value="age">Sort by Age</option>
					<option className="bg-gray-900 text-white" value="status">Sort by Status</option>
				</select>

			</div>

			{/* User List */}
			<div className="space-y-4">
				{loading ? (
					<div className="text-white"><Loading /></div>
				) : users.length === 0 ? (
					<div className="text-white/70">No users found.</div>
				) : (
					users.map((user) => (
						<div key={user.id} className="bg-white/10 border border-white/20 p-4 rounded-xl flex justify-between items-center">
							<div className="flex items-center gap-4">
								<img
									src={user?.photos?.[0]?.base64 || "/default-profile.png"}
									alt={user.name || "Profile"}
									className="w-14 h-14 rounded-full object-cover border-2 border-white/30"
								/>
								<div>
									<p className="text-lg font-semibold text-white">{user.name}</p>
									<p className="text-sm text-white/60">Age: {user.age}</p>
									<p className="text-sm text-white/60">Gender: {user.gender}</p>
									<p className="text-sm text-white/60">Email: {user.email}</p>
									<p className={`text-sm ${user.isBanned ? "text-red-400" : "text-green-400"}`}>
										Status: {user.isBanned ? "banned" : "active"}
									</p>
								</div>
							</div>
							<button
								onClick={() => (user.isBanned ? handleUnban(user) : handleBan(user))}
								className={`px-4 py-1 rounded-full text-sm ${user.isBanned ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"} text-white`}
							>
								{user.isBanned ? "Unban" : "Ban"}
							</button>
						</div>
					))
				)}
			</div>

			{/* Pagination */}
			<div className="mt-6 flex justify-center gap-2">
				{Array.from({ length: totalPages }).map((_, idx) => (
					<button
						key={idx}
						onClick={() => setPage(idx)}
						className={`px-3 py-1 rounded-full text-sm ${page === idx ? "bg-pink-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
					>
						{idx + 1}
					</button>
				))}
			</div>
		</div>
	);
}
