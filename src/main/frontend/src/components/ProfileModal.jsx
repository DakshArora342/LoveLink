import { useState } from "react";

export default function ProfileModal({ profile, onClose }) {
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	if (!profile) return null;

	const images =
		profile.images && profile.images.length > 0
			? profile.images
			: ["/default-profile.png"]; // fallback image

	const handleImageClick = (e) => {
		const bounds = e.currentTarget.getBoundingClientRect();
		const clickX = e.clientX - bounds.left;

		setCurrentImageIndex((prev) =>
			clickX < bounds.width / 2
				? prev === 0
					? images.length - 1
					: prev - 1
				: prev === images.length - 1
					? 0
					: prev + 1
		);
	};

	// Collect all "tags" together (interests + custom fields)
	const tags = [
		...(profile?.interests || []),
		profile?.communicationStyle,
		profile?.loveLanguage,
		profile?.intellectualTurnOn,
		profile?.weekendVibe,
	].filter(Boolean); // remove null/undefined

	return (
		<div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
			<div
				className="relative w-[90%] max-w-md h-[65vh] rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
				onClick={handleImageClick}
			>
				{/* Background Image */}
				<img
					src={images[currentImageIndex]}
					alt={profile?.name || "Profile"}
					className="absolute inset-0 w-full h-full object-cover z-0"
					onError={(e) => {
						e.currentTarget.src = "/default-profile.png";
					}}
				/>

				{/* Info Section */}
				<div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 via-black/40 to-transparent backdrop-blur-md p-5 text-white z-10">
					<h2 className="text-xl font-bold drop-shadow-lg">
						{profile?.name || "Unknown"}, {profile?.age || ""}
					</h2>

					{/* Interests & Tags */}
					{tags.length > 0 && (
						<div className="mt-3 flex flex-wrap gap-2">
							{tags.map((tag, i) => (
								<span
									key={i}
									className="text-xs bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20 shadow-sm"
								>
									{tag}
								</span>
							))}
						</div>
					)}
				</div>

				{/* Close Button */}
				<button
					onClick={onClose}
					className="absolute top-3 right-3 z-20 text-white text-xl bg-black/50 hover:bg-black/70 rounded-full w-8 h-8 flex items-center justify-center shadow-lg backdrop-blur-sm"
				>
					✕
				</button>
			</div>
		</div>
	);
}
