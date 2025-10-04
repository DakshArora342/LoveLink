import { motion } from "framer-motion";

export default function ProgressBar({ step, totalSteps }) {
	const percent = ((step + 1) / totalSteps) * 100;

	return (
		<div className="w-full h-2 bg-gray-200 fixed top-0 left-0 z-30">
			<motion.div
				initial={{ width: 0 }}
				animate={{ width: `${percent}%` }}
				transition={{ duration: 0.4 }}
				className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 rounded-r-full relative"
			>
				<motion.div
					className="absolute right-[-12px] top-1/2 -translate-y-1/2 text-yellow-300 text-lg"
					animate={{
						y: [0, -4, 0],
						opacity: [1, 0.7, 1],
						rotate: [0, 15, -15, 0],
					}}
					transition={{
						duration: 1,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				>
					✨
				</motion.div>
			</motion.div>
		</div>
	);
}
