import { useState, useEffect } from "react";
import { toast, ToastContainer, Bounce } from "react-toastify";
import { FiArrowLeft } from "react-icons/fi";

import "react-toastify/dist/ReactToastify.css";

export default function Gender({ next, back }) {
	const [gender, setGender] = useState("Custom"); // Default to Custom
	const [customGender, setCustomGender] = useState("");

	const genderOptions = ["Male", "Female"];

	useEffect(() => {
		const savedGender = localStorage.getItem("profile_gender");
		if (savedGender) {
			const normalized = savedGender.toLowerCase();
			const match = genderOptions.find((g) => g.toLowerCase() === normalized);
			if (match) {
				setGender(match);
			} else {
				setGender("Custom");
				setCustomGender(savedGender);
			}
		}
	}, []);

	const handleContinue = () => {
		const finalGender = gender === "Custom" ? customGender.trim() : gender;
		if (!finalGender) return;

		localStorage.setItem("profile_gender", finalGender.toLowerCase());
		setTimeout(() => next(), 1000);
	};

	return (
		<div className="relative min-h-screen w-full overflow-hidden">
			<ToastContainer
				position="top-right"
				autoClose={3000}
				transition={Bounce}
				theme="light"
			/>

			{/* 🔙 Back Button */}
			<button
				onClick={back}
				className="absolute top-4 left-4 text-white text-xl z-20"
			>
				<FiArrowLeft size={24} />
			</button>

			<div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
				<div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8">
					<h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">
						Select Your Gender
					</h2>

					{/* Gender Options */}
					<div className="flex flex-wrap justify-center gap-3 mb-6">
						{genderOptions.map((option) => (
							<button
								key={option}
								onClick={() => setGender(option)}
								className={`px-4 py-2 rounded-full font-medium text-sm sm:text-base transition-all duration-300 ${gender === option
										? "bg-pink-600 text-white shadow"
										: "bg-white text-pink-600 border border-pink-300"
									}`}
							>
								{option}
							</button>
						))}
					</div>

					{/* ⚠️ Gender Change Warning */}
					<p className="text-sm text-red-300 text-center mb-4">
						Once you select your gender, it cannot be changed later.
					</p>

					{/* Continue Button with gradient glow */}
					<button
						onClick={handleContinue}
						disabled={!gender || (gender === "Custom" && !customGender.trim())}
						className={`relative w-full py-3 font-semibold rounded-full overflow-hidden transition-all ${gender && (gender !== "Custom" || customGender.trim())
								? "bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white hover:from-pink-600 hover:via-rose-600 hover:to-purple-600"
								: "bg-gray-300 text-gray-500 cursor-not-allowed"
							}`}
					>
						{/* Animated glowing overlay */}
						{gender && (gender !== "Custom" || customGender.trim()) && (
							<span className="absolute inset-0 bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 opacity-30 animate-[glow_2s_linear_infinite] rounded-full"></span>
						)}
						<span className="relative z-10">Continue</span>
					</button>
				</div>
			</div>
		</div>
	);
}
