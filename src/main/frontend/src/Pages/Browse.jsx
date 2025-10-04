import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Stack from "../components/Stack";
import ProfileCard from "../components/ProfileCard";
import axiosInstance, { fetchProfile } from "../utils/axios";
import Loading from "../components/Loading";
import logger from "../utils/logger";

export default function Browse() {
	const [filteredProfiles, setFilteredProfiles] = useState([]);
	const [loading, setLoading] = useState(true);
	const [profile, setProfile] = useState({});
	const [showGenderPopup, setShowGenderPopup] = useState(false);

	// New state for swipe instructions popup
const [showSwipeInstructions, setShowSwipeInstructions] = useState(() => {
  return !sessionStorage.getItem("swipeInstructionsSeen");
});


	const navigate = useNavigate(); // ✅ React Router hook for navigation

	useEffect(() => {
		const loadProfile = async () => {
			try {
				const data = await fetchProfile();
				setProfile(data);

				if (!data.gender || typeof data.gender !== "string" || !data.gender.trim()) {
					setShowGenderPopup(true);
					setLoading(false);
				} else {
					setShowGenderPopup(false);
				}
			} catch (err) {
				// console.error("Error loading profile:", err);
				setLoading(false);
			}
		};

		loadProfile();
	}, []);

	useEffect(() => {
		if (showGenderPopup) return;

		if (!profile || !profile.gender || typeof profile.gender !== "string") return;

		const myGender = profile.gender.trim().toLowerCase();
		const lookingFor =
			myGender === "male" ? "female" : myGender === "female" ? "male" : null;

		if (!lookingFor) return;

		const fetchProfiles = async () => {
			setLoading(true);

			try {
				const response = await axiosInstance.get("user-profiles/browse", {
					params: { lookingForGender: lookingFor, page: 0, size: 20 },
				});

				const content = response.data.content.map((profile) => ({
					...profile,
					images: profile.photos || [],
				}));

				setFilteredProfiles(content);
			} catch (error) {
				logger.error(error);
				// console.error("Error fetching profiles:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchProfiles();
	}, [profile, showGenderPopup]);

	// ✅ Gender popup with navigate button
	const GenderPopup = () => (
		<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
				<h2 className="text-3xl font-bold mb-4 text-gray-900">Gender Not Set</h2>
				<p className="text-gray-700 mb-6">
					Please set your gender in the <span className="font-semibold text-blue-600">Profile</span> tab before browsing.
				</p>
				<p className="text-sm text-gray-500 mb-8">
					You can update your gender anytime in your profile settings.
				</p>
				<button
					onClick={() => navigate("/profile")} // ✅ Navigate to /profile route
					className="inline-block bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition"
				>
					Go to Profile
				</button>
			</div>
		</div>
	);

	const SwipeInstructionsPopup = ({ setShowSwipeInstructions }) => (
  <div className="fixed inset-0 bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-400 bg-opacity-90 flex items-center justify-center z-50 p-6 animate-fadeInScale">
    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center font-sans relative">
      <h2 className="text-3xl font-extrabold mb-6 text-pink-600 tracking-wide drop-shadow-md">
        How it works ❤️
      </h2>
      <ul className="text-left mb-8 space-y-5 text-gray-700 text-lg font-medium">
        <li className="flex items-center gap-3">
          <span className="inline-block text-3xl rounded-full bg-pink-100 text-pink-600 w-10 h-10 flex items-center justify-center shadow-md">⬆️</span>
          <strong>Swipe Up</strong> = Super Like
        </li>
        <li className="flex items-center gap-3">
          <span className="inline-block text-3xl rounded-full bg-green-100 text-green-600 w-10 h-10 flex items-center justify-center shadow-md">➡️</span>
          <strong>Swipe Right</strong> = Like
        </li>
        <li className="flex items-center gap-3">
          <span className="inline-block text-3xl rounded-full bg-red-100 text-red-600 w-10 h-10 flex items-center justify-center shadow-md">⬅️</span>
          <strong>Swipe Left</strong> = Reject
        </li>
      </ul>
      <button
        onClick={() => {
          sessionStorage.setItem("swipeInstructionsSeen", "true");
          setShowSwipeInstructions(false);
        }}
        className="inline-flex items-center justify-center gap-2 bg-pink-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-pink-700 transform hover:scale-105 transition duration-300 ease-in-out"
      >
        <span>Got it!</span>
        <svg
          className="w-6 h-6 animate-bounce"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 21C12 21 7 16 7 11a5 5 0 0 1 10 0c0 5-5 10-5 10z" />
          <circle cx="12" cy="11" r="3" />
        </svg>
      </button>
    </div>

    <style jsx>{`
      @keyframes fadeInScale {
        0% {
          opacity: 0;
          transform: scale(0.8);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }
      .animate-fadeInScale {
        animation: fadeInScale 0.4s ease forwards;
      }
      .animate-bounce {
        animation: bounce 1.5s infinite;
      }
      @keyframes bounce {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-6px);
        }
      }
    `}</style>
  </div>
);



	return (
		<div className="fixed inset-0 overflow-hidden z-0">
			{showSwipeInstructions && <SwipeInstructionsPopup />}
			{showSwipeInstructions && (
  <SwipeInstructionsPopup setShowSwipeInstructions={setShowSwipeInstructions} />
)}

			{/* Logo */}
			<div className="absolute top-4 left-4 z-20">
				<h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-md">
					Love-Link 💖
				</h1>
			</div>

			{/* Main content */}
			<div className="w-full h-full flex items-center justify-center z-10">
				{loading ? (
					<Loading />
				) : showGenderPopup ? (
					<GenderPopup />
				) : filteredProfiles.length === 0 ? (
					<p className="text-white">No matching profiles found.</p>
				) : (
					<Stack
						cardsData={filteredProfiles}
						randomRotation={true}
						sensitivity={160}
						sendToBackOnClick={false}
						cardDimensions={{ width: 360, height: 540 }}
						renderCard={(profile) => <ProfileCard profile={profile} />}
					/>
				)}
			</div>
		</div>
	);
}