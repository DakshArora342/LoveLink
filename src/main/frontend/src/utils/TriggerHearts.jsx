import { useState, useRef } from "react";
import { motion } from "framer-motion";

export default function TriggerHearts({ navigateTo = null, children }) {
	const [showHearts, setShowHearts] = useState(false);
	const audioRef = useRef(null);

	const triggerHearts = () => {
		setShowHearts(true);
		audioRef.current?.play();

		setTimeout(() => {
			setShowHearts(false);
			if (navigateTo) {
				window.location.href = navigateTo; // react-router ka navigate() bhi use kar sakte ho
			}
		}, 2000);
	};

	const totalHearts = 80;
	const randomHearts = Array.from({ length: totalHearts }).map((_, i) => {
		const gap = 100 / totalHearts;
		return {
			id: i,
			left: `${i * gap + Math.random() * gap * 0.4}%`,
			top: `${Math.floor(Math.random() * 5) * 20}%`,
			size: Math.random() * 30 + 10,
			delay: Math.random() * 0.5,
			emoji: ["💖", "❤️", "💘", "💕"][Math.floor(Math.random() * 4)],
		};
	});

	return (
		<>
			{/* ❤️ Hearts Animation (FULL PAGE FIXED OVERLAY) */}
			{showHearts && (
				<div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
					{randomHearts.map((heart) => (
						<motion.div
							key={heart.id}
							className="absolute"
							style={{
								left: heart.left,
								top: "-40px",
								fontSize: `${heart.size}px`,
							}}
							initial={{ y: 0, opacity: 1 }}
							animate={{ y: "100vh", opacity: 0 }}
							transition={{
								duration: 2,
								delay: heart.delay,
							}}
						>
							{heart.emoji}
						</motion.div>
					))}
				</div>
			)}

			{/* 🔉 Sound Effect */}
			<audio
				ref={audioRef}
				src="/sounds/heart-pop.mp3"
				preload="auto"
				className="hidden"
			/>

			{/* ⬇️ Children function ko triggerHearts pass karte hain */}
			{children({ triggerHearts })}
		</>
	);
}
