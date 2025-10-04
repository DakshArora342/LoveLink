import { motion } from "framer-motion";

export default function Loading() {
	return (
		<div className="flex justify-center items-center h-screen w-full bg-transparent">
			<div className="relative flex items-center justify-center">
				{/* Floating Hearts */}
				{[...Array(5)].map((_, i) => (
					<motion.div
						key={i}
						initial={{ y: 0, opacity: 0 }}
						animate={{ y: [0, -30, 0], opacity: [0, 1, 0] }}
						transition={{
							duration: 2,
							repeat: Infinity,
							delay: i * 0.4,
							ease: "easeInOut",
						}}
						className="absolute text-pink-500 text-3xl"
						style={{
							left: `${i * 20 - 40}px`,
							top: `${Math.random() * 40 - 20}px`,
						}}
					>
						❤️
					</motion.div>
				))}

				{/* Spinner */}
				<motion.div
					className="w-20 h-20 rounded-full border-4 border-pink-500 border-t-transparent"
					animate={{ rotate: 360 }}
					transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
					style={{
						boxShadow: "0 8px 20px rgba(255, 105, 180, 0.4)",
					}}
				/>
			</div>
		</div>
	);
}
