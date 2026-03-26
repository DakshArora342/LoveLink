import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import OrbitCarousel from "../components/OrbitCarousel";
import { useState, useRef } from "react";
import Iridescence from "../components/Iridescence";
import FeatureCardsOnScroll from "../components/FeatureCardsOnScroll";
import TriggerHearts from "../utils/TriggerHearts";
const IRIDESCENCE_COLOR = [0.4, 0.1, 0.5];
export default function FeaturesPage() {

	return (
		<div className="min-h-screen relative text-center overflow-hidden">
			{/* 🌈 Iridescent Background */}
			<div className="fixed inset-0 -z-10">
				<Iridescence color={IRIDESCENCE_COLOR} speed={1} amplitude={0.1} mouseReact={false} />
			</div>


			{/* 🟣 Fixed Top-Right Button Above Title */}
			<div className="fixed top-4 right-4 z-30">
				<TriggerHearts navigateTo="/auth">
					{({ triggerHearts }) => (
						<button
							onClick={triggerHearts}
							className="bg-white/20 backdrop-blur-xl border border-pink-300 text-white px-6 py-2 rounded-full shadow-md font-semibold hover:bg-white/30 transition duration-200"
						>
							Get Started
						</button>
					)}
				</TriggerHearts>
			</div>

			{/* ✅ Scrollable Section */}
			<div className="overflow-y-auto max-h-screen pb-28 px-4">
				{/* 🔝 Title */}
				<h2 className="text-3xl font-bold text-fuchsia-300 mt-20 pb-6">
					Discover 💘
				</h2>


				{/* 🔄 Carousel */}
				<OrbitCarousel />

				{/* Features Section */}
				<div className="mt-16 max-w-6xl mx-auto text-center">
					<motion.h2
						className="text-3xl sm:text-4xl font-bold text-fuchsia-300 mb-10"
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
					>
						Why Love-Link?
					</motion.h2>

					{/* 💡 Feature Cards */}
					<FeatureCardsOnScroll />
				</div>
			</div>
		</div>
	);
}
