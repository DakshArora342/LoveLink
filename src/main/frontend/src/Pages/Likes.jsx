import { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import ProfileModal from "../components/ProfileModal"; // Optional
import Loading from "../components/Loading";

const tabs = [
	{ key: "received", label: "Likes Received", endpoint: "/actions/received" },
	{ key: "sent", label: "Likes Sent", endpoint: "/actions/sent" },
	{ key: "super", label: "Top Super Likes", endpoint: "/actions/superlikes/top" },
];

export default function Likes() {
	const [activeTab, setActiveTab] = useState(0);
	const [selectedProfile, setSelectedProfile] = useState(null);
	const [data, setData] = useState({
		received: { items: [], page: 0, totalPages: 1 },
		sent: { items: [], page: 0, totalPages: 1 },
		super: { items: [], page: 0, totalPages: 1 },
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const currentTab = tabs[activeTab];


	const fetchPage = async (tabKey, page = 0, append = false) => {
		setLoading(true);
		setError(null);
		try {
			const endpoint = tabs.find((tab) => tab.key === tabKey)?.endpoint;
			const res = await axiosInstance.get(endpoint, {
				// params: { page, size: 10 },
				params: { page, size: tabKey === "super" ? 5 : 10 },
			});
			const { content, totalPages, number } = res.data;

			setData((prev) => ({
				...prev,
				[tabKey]: {
					items: append ? [...prev[tabKey].items, ...content] : content,
					page: number,
					totalPages,
				},
			}));
		} catch (e) {
			setError("Failed to load likes. Please try again.");
			// console.error(e);
		} finally {
			setLoading(false);
		}
	};

	// On component mount, fetch first page of all tabs to get counts
	useEffect(() => {
		tabs.forEach(({ key }) => {
			fetchPage(key, 0, false);
		});
	}, []);

	// On active tab change, fetch that tab’s data again
	useEffect(() => {
		fetchPage(currentTab.key, 0, false);
	}, [activeTab]);


	const loadMore = () => {
		const tabData = data[currentTab.key];
		if (tabData.page + 1 < tabData.totalPages && !loading) {
			fetchPage(currentTab.key, tabData.page + 1, true);
		}
	};

	const tabClass = (i) =>
		`text-xs sm:text-sm font-semibold px-4 py-2 rounded-full transition-all ${i === activeTab ? "bg-pink-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
		}`;

	return (
		<div className="relative min-h-screen px-4 pt-20 pb-32 bg-transparent backdrop-blur-md text-white">
			<h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 drop-shadow">❤️ Likes Overview</h1>

			{/* Tab Switcher */}
			<div className="flex justify-center gap-2 sm:gap-4 mb-6">
				{tabs.map(({ label }, i) => (
					<button key={i} className={tabClass(i)} onClick={() => setActiveTab(i)}>
						{label} ({data[tabs[i].key].items.length})
					</button>
				))}
			</div>

			{error && <p className="text-center text-red-500 mb-4">{error}</p>}

			{/* Card List */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{data[currentTab.key].items.length === 0 && !loading && (
					<p className="text-center col-span-2 text-white/70 mt-10">
						{currentTab.key === "received"
							? "No one has liked you yet 😢"
							: currentTab.key === "sent"
								? "You haven’t liked anyone yet!"
								: "No super likes yet... Be bold! ✨"}
					</p>
				)}

				{data[currentTab.key].items.map((profile) => (
					<div
						key={profile.id}
						onClick={() => {
							setSelectedProfile({
								...profile,
								images: profile.photos?.map((p) => p.base64) || [],
							});
							// console.log("Opening modal with images:", profile.photos);

						}}
						className="cursor-pointer bg-white/10 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-4 border border-white/20 shadow-xl hover:bg-white/20 transition"
					>
						<img
							src={profile?.photos?.[0]?.base64 || "/default-profile.png"}
							alt={profile.name}
							className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white/30"
						/>
						<div>
							<h2 className="text-lg font-bold text-white drop-shadow">
								{profile.name}, {profile.age}
							</h2>
							<p className="text-xs text-white/70 mt-1">
								{currentTab.key === "received"
									? "Liked you ❤️"
									: currentTab.key === "sent"
										? "You liked 💘"
										: <>Super like count ✨ {profile.superlikeCount}</>}
							</p>
						</div>

					</div>
				))}
			</div>

			{loading && <p className="text-center mt-4 text-white/70"><Loading></Loading></p>}

			{currentTab.key !== "super" &&
				!loading &&
				data[currentTab.key].page + 1 < data[currentTab.key].totalPages && (
					<div className="flex justify-center mt-6">
						<button
							className="px-6 py-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold transition"
							onClick={loadMore}
						>
							Load More
						</button>
					</div>
				)}


			{/* Profile Modal (optional) */}
			{selectedProfile && (
				<ProfileModal
					profile={selectedProfile}
					onClose={() => setSelectedProfile(null)}
				/>
			)}
		</div>
	);
}
