import { useState, useEffect } from "react";
import { toast, ToastContainer, Bounce } from "react-toastify";
import { FiArrowLeft } from "react-icons/fi";
import { motion } from "framer-motion";

import "react-toastify/dist/ReactToastify.css";

export default function AgeInput({ next, back }) {
	const [age, setAge] = useState("");
	const [isFocused, setIsFocused] = useState(false);

	useEffect(() => {
		const saved = localStorage.getItem("profile_age");
		if (saved) setAge(saved);
	}, []);

	const handleNext = () => {
		const parsedAge = parseInt(age, 10);

		if (isNaN(parsedAge) || parsedAge <= 0) {
			toast.error("Please enter a valid age.");
			return;
		}

		if (parsedAge < 18) {
			toast.error("You must be at least 18 years old.");
			return;
		}

		if (parsedAge > 120) {
			toast.error("Please enter a realistic age.");
			return;
		}

		localStorage.setItem("profile_age", String(parsedAge));
		setTimeout(() => next(), 1000);
	};

	return (
		<div className="relative min-h-screen w-full flex items-center justify-center px-4 overflow-hidden">


			<ToastContainer
				position="top-right"
				autoClose={3000}
				transition={Bounce}
				theme="light"
			/>

			{/* Back Button */}
			<button
				onClick={back}
				className="absolute top-4 left-4 text-white text-xl z-20"
			>
				<FiArrowLeft size={24} />
			</button>

			{/* Main Card */}
			<motion.div
				initial={{ scale: 0.95, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ duration: 0.6 }}
				className="w-full max-w-sm sm:max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8"
			>
				<h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2 drop-shadow-md">
					Your Age 🎂
				</h2>

				{/* Funny subtext */}
				<p className="text-center text-pink-200 text-sm sm:text-base md:text-lg font-medium mb-6 leading-relaxed drop-shadow">
					Age is just a number… but it still has to be{" "}
					<span className="font-bold text-yellow-300">18+</span> 😏
				</p>

				{/* Input with Pink-Purple Snake Border */}
				<div className="relative w-full mb-6">
					{/* Snake Border */}
					<motion.div
						initial={{ backgroundPosition: "0% 50%" }}
						animate={{ backgroundPosition: "200% 50%" }}
						transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
						className={`absolute inset-0 rounded-full border-2 border-transparent 
                        bg-gradient-to-r from-pink-500 via-rose-400 to-purple-500 
                        bg-[length:200%_200%] ${isFocused
								? "shadow-[0_0_25px_rgba(236,72,153,0.7)]"
								: ""
							}`}
					/>
					{/* Input (clean inside) */}
					<input
						type="number"
						min="0"
						max="120"
						value={age}
						onChange={(e) => setAge(e.target.value)}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						className="relative w-full px-6 py-3 rounded-full bg-black/40 backdrop-blur text-white 
                       text-base sm:text-lg placeholder-white/70 focus:outline-none text-center 
                       [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
						placeholder="Enter your age"
					/>
				</div>

				{/* Next Button */}
				<button
					onClick={handleNext}
					className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white py-3 sm:py-4 
                     rounded-full hover:from-pink-600 hover:via-rose-600 hover:to-purple-600 transition font-semibold text-base sm:text-lg"
				>
					Next
				</button>
			</motion.div>
		</div>
	);
}
