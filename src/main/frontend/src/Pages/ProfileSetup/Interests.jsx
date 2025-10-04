import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer, Bounce } from "react-toastify";
import { FiArrowLeft } from "react-icons/fi";

import "react-toastify/dist/ReactToastify.css";
import logger from "../../utils/logger";

const communicationStyles = [
	"📱 Big time texter",
	"📞 Phone caller",
	"🎥 Video chatter",
	"😅 Bad texter",
	"🧍 Better in person"
];

const loveLanguages = [
	"🎁 Presents",
	"🫂 Touch",
	"💬 Compliments",
	"🕰️ Time together",
	"💡 Thoughtful gestures"
];

const intellectualTurnOns = [
	"🧠 Deep conversations",
	"⚡ Quick wit",
	"🎨 Creative thinker",
	"🔍 Curiosity",
	"🚀 Ambition"
];

const weekendVibes = [
	"📺 Chill & Netflix",
	"🎉 Party hard",
	"⛰️ Nature escape",
	"🛁 Self-care & rest",
	"🍔 Foodie adventures"
];


export default function Interests({ next, back }) {
	const [selected, setSelected] = useState({
		communication: "",
		loveLanguage: "",
		intellectual: "",
		weekend: ""
	});

	useEffect(() => {
		const saved = localStorage.getItem("profile_interests");
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				if (parsed && typeof parsed === "object") setSelected(parsed);
			} catch (e) {
				logger.error(e);
				// console.error("Failed to parse saved interests:", e);
			}
		}
	}, []);

	const toggle = (section, val) => {
		setSelected((prev) => ({ ...prev, [section]: val }));
	};

	const handleNext = () => {
		const allSelected = Object.values(selected).every((v) => v);
		if (!allSelected) return;
		localStorage.setItem("profile_interests", JSON.stringify(selected));
		setTimeout(() => next(), 1200);
	};

	const renderSection = (title, options, sectionKey) => (
		<div className="mb-6">
			<h3 className="text-sm sm:text-base font-semibold mb-2 text-white/90">{title}</h3>
			<div className="flex flex-wrap gap-2">
				{options.map((item) => (
					<motion.button
						key={item}
						onClick={() => toggle(sectionKey, item)}
						whileTap={{ scale: 0.95 }}
						className={`px-4 py-2 rounded-full text-sm sm:text-base font-medium transition-all border
              ${selected[sectionKey] === item
								? "bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white border-transparent shadow-lg"
								: "bg-white/20 text-white border-white/30 hover:bg-white/30"
							}`}
					>
						{item}
					</motion.button>
				))}
			</div>
		</div>
	);

	return (
		<div className="relative min-h-screen w-full overflow-hidden">


			<ToastContainer position="top-right" autoClose={3000} transition={Bounce} theme="light" />

			<button onClick={back} className="absolute top-4 left-4 text-white text-xl z-20">
				<FiArrowLeft size={24} />
			</button>

			<div className="relative z-10 pt-20 pb-10 px-4 overflow-y-auto max-h-screen">
				<motion.div
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.6 }}
					className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8"
				>
					<h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-white text-center mb-1 drop-shadow-md">
						What else makes you—you?
					</h2>
					<p className="text-sm text-white/90 text-center mb-6">
						Be real. Authenticity attracts authenticity.
					</p>

					{renderSection("What is your communication style?", communicationStyles, "communication")}
					{renderSection("How do you receive love?", loveLanguages, "loveLanguage")}
					{renderSection("What turns you on intellectually?", intellectualTurnOns, "intellectual")}
					{renderSection("Your vibe on a perfect weekend?", weekendVibes, "weekend")}

					<motion.button
						onClick={handleNext}
						disabled={Object.values(selected).some((v) => !v)}
						whileHover={Object.values(selected).every((v) => v) ? { scale: 1.05 } : {}}
						className={`mt-4 w-full py-3 rounded-full font-semibold transition text-center ${Object.values(selected).every((v) => v)
								? "bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white shadow-lg hover:shadow-pink-400/50"
								: "bg-gray-300 text-gray-500 cursor-not-allowed"
							}`}
					>
						Next
					</motion.button>
				</motion.div>
			</div>
		</div>
	);
}
