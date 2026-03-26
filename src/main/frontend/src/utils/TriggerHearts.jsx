import { useState, useRef, useMemo } from "react";
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
				window.location.href = navigateTo; 
			}
		}, 2000);
	};

	// ✅ FIX: Memoize the array so it's calculated ONLY ONCE, not on every frame.
	// ✅ FIX: Reduced totalHearts from 80 to 35 for smooth 60fps performance.
	const randomHearts = useMemo(() => {
		const totalHearts = 35; 
		return Array.from({ length: totalHearts }).map((_, i) => {
			const gap = 100 / totalHearts;
			return {
				id: i,
				left: `${i * gap + Math.random() * gap * 0.4}%`,
				top: "-40px", 
				size: Math.random() * 25 + 15,
				delay: Math.random() * 0.3,
				emoji: ["💖", "❤️", "💘", "💕"][Math.floor(Math.random() * 4)],
			};
		});
	}, []);

	return (
		<>
			{/* ❤️ Hearts Animation */}
			{showHearts && (
				<div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
					{randomHearts.map((heart) => (
						<motion.div
							key={heart.id}
							className="absolute will-change-transform" // ✅ FIX: Hardware acceleration hint
							style={{
								left: heart.left,
								top: heart.top,
								fontSize: `${heart.size}px`,
							}}
							initial={{ y: 0, opacity: 1, scale: 0.8 }}
							animate={{ y: "100vh", opacity: 0, scale: 1.2 }}
							transition={{
								duration: 1.5, // slightly faster to feel more explosive
								delay: heart.delay,
								ease: "easeOut"
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

			{/* ⬇️ Children function */}
			{children({ triggerHearts })}
		</>
	);
}
