import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { FiArrowLeft } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { motion } from "framer-motion";

import axiosInstance from "../../utils/axios";
import "react-toastify/dist/ReactToastify.css";
import logger from "../../utils/logger";

export default function Photos({ back }) {
	const [isSubmitting, setIsSubmitting] = useState(false);


	const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB max
	const ALLOWED_TYPES = [
		"image/jpeg",
		"image/jpg",
		"image/png"
	];

	const navigate = useNavigate();
	const [images, setImages] = useState([]);


	const handleImageChange = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate type and size
		if (!ALLOWED_TYPES.includes(file.type)) {
			// toast.error("Unsupported file type");
			return;
		}

		if (file.size > MAX_IMAGE_SIZE) {
			// toast.error("File is too large");
			return;
		}

		// Add to state
		const newImage = {
			url: URL.createObjectURL(file),
			file,
		};

		setImages((prev) => [...prev, newImage]);

		// Reset input so same file can be selected again if needed
		e.target.value = null;
	};


	const handleDelete = (index) => {
		const img = images[index];
		if (img.file) {
			URL.revokeObjectURL(img.url); // Clean up memory
		}
		setImages((prev) => prev.filter((_, i) => i !== index));
	};


	const collectProfileData = () => {
		const lifestyle = JSON.parse(localStorage.getItem("profile_lifestyle") || "{}");
		const interests = JSON.parse(localStorage.getItem("profile_interests") || "{}");

		return {
			name: localStorage.getItem("profile_name"),
			age: localStorage.getItem("profile_age"),
			gender: localStorage.getItem("profile_gender"),
			communicationStyle: interests.communication || "",
			intellectualTurnOn: interests.intellectual || "",
			loveLanguage: interests.loveLanguage || "",
			weekendVibe: interests.weekend || "",
			relationshipGoal: lifestyle.relationshipGoal || "",
			petPreference: lifestyle.petPreference || "",
			partyStyle: lifestyle.partyStyle || "",
			zodiacSign: lifestyle.zodiacSign || "",
			about: "",
			branch: "",
		};
	};

	const getUser = () => {
		const user = localStorage.getItem("user");
		return user ? JSON.parse(user) : null;
	};

	const submitProfile = async (withImages = true) => {
		const user = getUser();
		if (!user) return;

		const profile = collectProfileData();
		const formData = new FormData();
		formData.append(
			"profile",
			new Blob([JSON.stringify(profile)], { type: "application/json" })
		);
		formData.append("userId", user);

		if (withImages) {
			images.forEach((img) => formData.append("images", img.file));
		}

		try {
			await axiosInstance.post("/user-profiles", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			// ✅ Clear all profile-related data from localStorage
			localStorage.removeItem("profile_current_step");
			localStorage.removeItem("profile_name");
			localStorage.removeItem("profile_age");
			localStorage.removeItem("profile_gender");
			localStorage.removeItem("profile_interests");
			localStorage.removeItem("profile_lifestyle");

			// Optional: Also clear the "user" key if it's temporary or session-based
			// localStorage.removeItem("user");

			setTimeout(() => navigate("/browse"), 1000);
		} catch (err) {
			// console.error(err);

			logger.error(err);
		}
	};



	const handleSubmit = () => {
		if (images.length === 0 || isSubmitting) return;

		setIsSubmitting(true);
		submitProfile(true);
	};



	const handleSkip = () => {
		if (isSubmitting) return;

		setIsSubmitting(true);
		submitProfile(false);
	};

	return (
		<div className="relative min-h-screen w-full overflow-hidden">

			<ToastContainer />

			<button onClick={back} className="absolute top-4 left-4 text-white text-xl z-20">
				<FiArrowLeft size={24} />
			</button>

			<div className="w-full max-w-md mx-auto mt-20 sm:mt-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8 relative z-10">
				<h2 className="text-2xl font-bold text-white text-center mb-2">Add your recent pics</h2>
				<p className="text-sm text-white/90 text-center mb-6">Add up to 6 photos for your profile.</p>

				<div className="grid grid-cols-3 gap-3">
					{images.map((img, i) => (
						<div key={i} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border border-rose-300 bg-gray-100">
							<img src={img.url} alt={`img-${i}`} className="w-full h-full object-cover" />
							<motion.button
								onClick={() => handleDelete(i)}
								whileTap={{ scale: 0.9 }}
								className="absolute top-1 right-1 p-1 rounded-full bg-white/90 text-rose-600 hover:text-red-600 shadow"
							>
								<MdDelete size={20} />
							</motion.button>
						</div>
					))}



					{images.length < 6 &&
						Array.from({ length: 6 - images.length }).map((_, i) => (
							<label
								key={`upload-${i}`}
								className="flex items-center justify-center aspect-[3/4] rounded-lg bg-white/30 border border-dashed border-rose-400 cursor-pointer hover:bg-rose-100 transition relative"
							>
								<span className="text-rose-600 font-bold text-2xl">+</span>
								<input
									type="file"
									accept="image/jpeg,image/jpg,image/png"
									onChange={handleImageChange}
									className="absolute inset-0 opacity-0 cursor-pointer"
									disabled={images.length >= 6}
								/>
							</label>
						))}


					<input
						id="image-upload"
						type="file"
						accept="image/jpeg,image/jpg,image/png"
						onChange={handleImageChange}
						className="hidden"
						multiple={false}
					/>


				</div>


				<motion.button
					onClick={handleSubmit}
					disabled={images.length === 0 || isSubmitting}
					whileHover={images.length > 0 && !isSubmitting ? { scale: 1.05 } : {}}
					whileTap={{ scale: 0.95 }}
					className={`mt-6 w-full py-3 rounded-full font-semibold transition text-center ${images.length > 0 && !isSubmitting
						? "bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white shadow-lg hover:shadow-pink-400/50"
						: "bg-gray-300 text-gray-500 cursor-not-allowed"
						}`}
				>
					{isSubmitting ? "Setting up your profile..." : "Setup Profile"}
				</motion.button>


				<motion.button
					onClick={handleSkip}
					whileTap={{ scale: 0.95 }}
					className="mt-3 w-full text-sm text-white/80 underline hover:text-white/100 transition"
				>
					Skip for now
				</motion.button>
			</div>
		</div>
	);
}