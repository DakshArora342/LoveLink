import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Iridescence from "../components/Iridescence";

const hearts = Array.from({ length: 15 });

export default function WelcomePage() {
	return (
		<div className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center px-4 sm:px-8 text-center">
			{/* 🌈 Iridescent Background */}
			<div className="fixed inset-0 -z-10">
				<Iridescence color={[0.4, 0.1, 0.5]} speed={1} amplitude={0.1} mouseReact={false} />
			</div>

			{/* 💖 Floating Hearts */}
			{hearts.map((_, i) => {
				// compute random-ish values (deterministic per render)
				const left = `${(i * 13) % 100}%`;
				const top = `${(i * 7 + (i % 3) * 5) % 100}%`;
				const delay = (i * 0.4) % 5;
				const duration = 5 + (i % 4) * 0.8;

				return (
					<motion.div
						key={`heart-${i}`}
						className="absolute text-pink-400 text-2xl select-none pointer-events-none z-0"
						style={{ left, top }}
						initial={{ opacity: 0, y: 0 }}
						animate={{ opacity: [0, 1, 0], y: -80 }}
						transition={{
							duration,
							repeat: Infinity,
							delay,
							ease: "easeInOut",
						}}
						aria-hidden
					>
						💖
					</motion.div>
				);
			})}

			{/* 💬 Glassmorphic Content Card */}
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.6 }}
				className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-12 max-w-xl w-full z-10 mb-11"
			>
				<motion.h1
					className="text-4xl sm:text-5xl font-extrabold text-white mb-4 drop-shadow"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					Love-Link 💘
				</motion.h1>

				<motion.p
					className="text-pink-100 text-sm sm:text-lg mb-6 leading-relaxed"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 0.6 }}
				>
					A private dating platform for students. Discover new connections, chat freely, and find your match! 💌
				</motion.p>

				<Link to="/features" aria-label="Get started with Love-Link">
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className="bg-white/20 border border-pink-300 text-white px-6 py-2 rounded-full font-semibold backdrop-blur-md shadow-md hover:bg-white/30 transition duration-200"
					>
						Get Started
					</motion.button>
				</Link>
			</motion.div>
		</div>
	);
}
