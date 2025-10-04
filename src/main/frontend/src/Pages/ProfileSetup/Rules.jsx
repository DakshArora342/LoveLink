import { motion } from "framer-motion";
import Lottie from "lottie-react";
import loveRulesAnimation from "../../animations/warning.json";
import { FiArrowLeft } from "react-icons/fi";

import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Rules({ next, back }) {
	const handleAgree = () => {
		localStorage.setItem("profile_rules_agreed", "true");
		setTimeout(() => next(), 1000);
	};

	const handleSkip = () => {
		localStorage.setItem("profile_rules_agreed", "false");
		setTimeout(() => next(), 800);
	};

	return (
		<div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden px-4">


			<ToastContainer
				position="top-right"
				autoClose={3000}
				transition={Bounce}
				theme="light"
			/>

			{/* 🔙 Back Button */}
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
				className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8 relative z-10"
			>
				{/* Lottie */}
				<div className="w-40 sm:w-56 md:w-64 mx-auto mb-4">
					<Lottie animationData={loveRulesAnimation} loop />
				</div>

				{/* Heading */}
				<h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4 drop-shadow-md">
					Community Rules 💖
				</h2>

				{/* Rules */}
				<ul className="text-sm sm:text-base text-white/90 list-disc list-inside space-y-2 text-left mb-6">
					<li>Be respectful to others.</li>
					<li>No spam or inappropriate content.</li>
					<li>Profiles violating rules will be removed.</li>
				</ul>

				{/* Agree Button */}
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.97 }}
					onClick={handleAgree}
					className="relative w-full py-3 rounded-full font-semibold text-white overflow-hidden
             bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500
             hover:from-pink-600 hover:via-rose-600 hover:to-purple-600 transition"
				>
					{/* Animated glowing overlay */}
					<span className="absolute inset-0 bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400
                   opacity-30 animate-[glow_2s_linear_infinite] rounded-full"></span>
					<span className="relative z-10">I Agree 💘</span>
				</motion.button>

			</motion.div>
		</div>
	);
}
