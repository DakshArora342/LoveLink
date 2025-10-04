import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer, Bounce } from "react-toastify";
import { FiArrowLeft } from "react-icons/fi";
import TypingText from "../../components/TypingText";

import "react-toastify/dist/ReactToastify.css";

export default function Name({ next, back }) {
	const [name, setName] = useState("");
	const [isFocused, setIsFocused] = useState(false);

	useEffect(() => {
		const savedName = localStorage.getItem("profile_name");
		const signupName = localStorage.getItem("signup_name");
		if (savedName) setName(savedName);
		else if (signupName) setName(signupName);
	}, []);

	const handleNext = () => {
		const trimmed = name.trim();
		if (!trimmed || /[@!#$%^&*0-9]+$/.test(trimmed)) {
			toast.error("Enter a valid name. No numbers or special characters at the end.", { toastId: "auth-toast" });
			return;
		}

		localStorage.setItem("profile_name", trimmed);
		setTimeout(() => next(), 1000);
	};

	return (
		<div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-4">


			<ToastContainer position="top-right" autoClose={3000} transition={Bounce} theme="light" />

			{/* Back Button */}
			{back && (
				<button
					onClick={back}
					className="absolute top-4 left-4 text-white text-xl z-20"
				>
					<FiArrowLeft size={24} />
				</button>
			)}

			{/* Main Card */}
			<motion.div
				initial={{ scale: 0.95, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ duration: 0.6 }}
				className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8 z-10"
			>
				<div className="text-center mb-4">
					<h2 className="text-base sm:text-lg text-white/80">Be a</h2>
					<h1 className="text-2xl sm:text-3xl font-bold text-white h-10">
						<TypingText />
					</h1>
				</div>

				{/* Input with Snake Border */}
				<div className="relative w-full mb-6">
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
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						placeholder="Enter your name"
						className="relative w-full px-6 py-3 rounded-full bg-black/40 backdrop-blur text-white
                       text-base sm:text-lg placeholder-white/70 focus:outline-none text-center z-10"
					/>
				</div>

				{/* Next Button */}
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.97 }}
					onClick={handleNext}
					className="w-full py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500
                     text-white rounded-full hover:from-pink-600 hover:via-rose-600 hover:to-purple-600
                     transition font-semibold text-base sm:text-lg"
				>
					Next
				</motion.button>
			</motion.div>
		</div>
	);
}
