import { useLocation, useNavigate } from "react-router-dom";
import Iridescence from "../components/Iridescence"; // Make sure this path is correct
import ProfileCard from "../components/ProfileCard"; // Make sure this matches the file name exactly

export default function ProfilePreview() {
	const location = useLocation();
	const navigate = useNavigate();
	const user = location.state?.user;

	if (!user) {
		return (
			<div className="min-h-screen flex items-center justify-center text-white bg-black">
				<p>No user data found.</p>
			</div>
		);
	}

	const fallbackUser = {
		...user,
		age: user.age || 20,
		bio: user.bio || "No bio available",
		interests: user.interests || ["No interests"],
		images:
			user.images && user.images.length > 0
				? user.images
				: ["https://via.placeholder.com/400x500.png?text=No+Image"],
	};

	return (
		<div className="relative min-h-screen w-full text-white overflow-hidden">
			{/* Iridescence Background */}
			<div className="absolute inset-0 -z-10">
				<Iridescence color={[0.4, 0.1, 0.5]} speed={1} amplitude={0.1} mouseReact={false} />
			</div>

			{/* Centered Glass Card */}
			<div className="relative z-10 max-w-md mx-auto px-4 py-20">
				<div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-xl p-4 sm:p-6">
					<ProfileCard profile={fallbackUser} />

					<button
						onClick={() => navigate(-1)}
						className="mt-6 w-full bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-full transition"
					>
						← Go Back
					</button>
				</div>
			</div>
		</div>
	);
}
