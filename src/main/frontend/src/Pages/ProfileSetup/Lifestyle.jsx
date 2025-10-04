import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer, Bounce } from "react-toastify";
import { FiArrowLeft } from "react-icons/fi";

import "react-toastify/dist/ReactToastify.css";

export default function Lifestyle({ next, back }) {
	const [answers, setAnswers] = useState({});
	const [firstName, setFirstName] = useState("");

	const questions = [
		{
			label: "What's your relationship goal?",
			key: "relationshipGoal",
			options: ["💬 Just friends", "🎯 Something casual", "🔍 Open to explore", "💞 Long-term"],
		},
		{
			label: "Do you like pets?",
			key: "petPreference",
			options: ["🐶 Dog person", "🐱 Cat person", "🐾 Animal lover", "🙅‍♂️ Not into pets"],
		},
		{
			label: "What's your party style?",
			key: "partyStyle",
			options: ["🎉 Party animal", "🛋️ Chill at home", "🎭 Depends on mood", "🙃 Rarely go out"],
		},
		{
			label: "What's your zodiac sign?",
			key: "zodiacSign",
			options: [
				"♑ Capricorn", "♒ Aquarius", "♓ Pisces", "♈ Aries", "♉ Taurus", "♊ Gemini",
				"♋ Cancer", "♌ Leo", "♍ Virgo", "♎ Libra", "♏ Scorpio", "♐ Sagittarius"
			],
		},
	];

	useEffect(() => {
		const savedName = localStorage.getItem("profile_name");
		if (savedName) setFirstName(savedName);

		const handleKey = (e) => {
			if (e.key === "Enter" && isFormComplete) handleSubmit();
		};
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [answers]);

	const isFormComplete = questions.every((q) => answers[q.key]);

	const handleChange = (key, val) => {
		setAnswers((prev) => ({ ...prev, [key]: val }));
	};

	const handleSubmit = () => {
		if (!isFormComplete) return;
		localStorage.setItem("profile_lifestyle", JSON.stringify(answers));
		setTimeout(() => next(), 1000);
	};

	return (
		<div className="relative min-h-screen w-full overflow-hidden">


			<ToastContainer position="top-right" autoClose={3000} transition={Bounce} theme="light" />

			{/* Back button */}
			<button
				onClick={back}
				className="absolute top-4 left-4 text-white text-xl z-20"
			>
				<FiArrowLeft size={24} />
			</button>

			<div className="relative z-10 pt-24 pb-10 px-4 overflow-y-auto max-h-screen">
				<motion.div
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.6 }}
					className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8"
				>
					<h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-1 drop-shadow-md">
						Let’s talk lifestyle habits{firstName && `, ${firstName}`}
					</h2>
					<p className="text-sm text-white/90 text-center mb-6">
						These fun facts help match you better!
					</p>

					{questions.map(({ label, key, options }) => (
						<div key={key} className="mb-6">
							<p className="font-medium text-white/90 mb-2">{label}</p>
							<div className="flex flex-wrap gap-2">
								{options.map((opt) => (
									<button
										key={opt}
										onClick={() => handleChange(key, opt)}
										className={`px-4 py-1 rounded-full text-sm font-medium transition border ${answers[key] === opt
												? "bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white border-transparent shadow-lg"
												: "bg-white/20 text-white border-white/30 hover:bg-white/30"
											}`}
									>
										{opt}
									</button>
								))}
							</div>
						</div>
					))}

					<button
						onClick={handleSubmit}
						disabled={!isFormComplete}
						className={`mt-4 mb-8 w-full py-3 rounded-full font-semibold transition text-center ${isFormComplete
								? "bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white shadow-lg hover:shadow-pink-400/50"
								: "bg-gray-300 text-gray-500 cursor-not-allowed"
							}`}
					>
						Next
					</button>
				</motion.div>
			</div>
		</div>
	);
}
