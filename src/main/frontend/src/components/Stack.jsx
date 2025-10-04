import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import axiosInstance from "../utils/axios";
import MatchPopup from "./MatchPopup"; // make sure this path is correct for your project
import logger from "../utils/logger";

export default function Stack({
	cardsData = [],
	cardDimensions = { width: 320, height: 500 },
	sensitivity = 160,
	renderCard,
	randomRotation = false,
}) {
	const [cards, setCards] = useState([]);
	const [matchUser, setMatchUser] = useState(null);
	const [showMatchPopup, setShowMatchPopup] = useState(false);

	useEffect(() => {
		setCards(cardsData);
	}, [cardsData]);

	const handleSwipe = () => {
		setCards((prev) => prev.slice(1));
	};

	// const storeAction = (key, profile) => {
	//   const stored = JSON.parse(localStorage.getItem(key) || "[]");
	//   const updated = [...stored, profile];
	//   localStorage.setItem(key, JSON.stringify(updated));
	// };

	const sendActionToAPI = async (profile, actionType) => {
		try {
			const res = await axiosInstance.post(`/actions/${profile.id}`, null, {
				params: { actionType },
			});

			if (
				res?.data?.message &&
				res.data.message.toLowerCase().includes("match")
			) {
				// const myImage = JSON.parse(localStorage.getItem("userImageBase64"));

				setMatchUser({
					...profile,
					// myImage,
				});

				setShowMatchPopup(true);
			}
		} catch (err) {
			logger.error(err);
			// console.error("Swipe action failed:", err);
		}
	};

	function CardRotate({ children, onLike, onNope, onSuperLike, sensitivity = 160, zIndex }) {
		const x = useMotionValue(0);
		const y = useMotionValue(0);
		const rotateX = useTransform(y, [-100, 100], [45, -45]);
		const rotateY = useTransform(x, [-100, 100], [-45, 45]);

		const likeOpacity = useTransform(x, [50, 120], [0, 1]);
		const nopeOpacity = useTransform(x, [-50, -120], [0, 1]);
		const superLikeOpacity = useTransform(y, [-120, -200], [0, 1]);

		const handleDragEnd = (_, info) => {
			const { offset } = info;

			if (offset.y < -sensitivity) {
				onSuperLike?.();
			} else if (offset.x > sensitivity) {
				onLike?.();
			} else if (offset.x < -sensitivity) {
				onNope?.();
			} else {
				x.set(0);
				y.set(0);
			}
		};

		return (
			<motion.div
				className="absolute cursor-grab w-full h-full"
				style={{ x, y, rotateX, rotateY, zIndex }}
				drag
				dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
				dragElastic={0.5}
				whileTap={{ cursor: "grabbing" }}
				onDragEnd={handleDragEnd}
			>
				{/* Like / Nope / Super Like Labels */}
				<div className="absolute top-1/3 w-full px-6 flex justify-between items-center pointer-events-none z-50">
					<motion.div
						className="text-green-500 text-3xl font-extrabold border-4 border-green-500 px-4 py-1 rounded-lg rotate-[-12deg] bg-white/80 backdrop-blur-sm"
						style={{ opacity: likeOpacity }}
					>
						LIKE
					</motion.div>
					<motion.div
						className="text-red-500 text-3xl font-extrabold border-4 border-red-500 px-4 py-1 rounded-lg rotate-[12deg] bg-white/80 backdrop-blur-sm"
						style={{ opacity: nopeOpacity }}
					>
						NOPE
					</motion.div>
				</div>

				<motion.div
					className="absolute top-6 left-1/2 -translate-x-1/2 text-blue-500 text-3xl font-extrabold border-4 border-blue-500 px-6 py-2 rounded-lg bg-white/80 backdrop-blur-sm z-50"
					style={{ opacity: superLikeOpacity }}
				>
					SUPER LIKE
				</motion.div>

				{children}
			</motion.div>
		);
	}

	return (
		<>
			<div
				className="relative mx-auto"
				style={{
					width: cardDimensions.width,
					height: cardDimensions.height,
					perspective: 800,
				}}
			>
				{cards.length === 0 ? (
					<p className="text-pink-700 font-semibold text-lg text-center">
						No more profiles 💔
					</p>
				) : (
					[...cards].map((card, index) => {
						const isTop = index === 0;
						const translateY = index * 8;
						const scale = 1 - index * 0.03;
						const rotation = randomRotation ? Math.random() * 8 - 4 : 0;

						return (
							<CardRotate
								key={card.id || `card-${index}`}
								onLike={() => {
									// storeAction("likes", card);
									sendActionToAPI(card, "LIKE");
									handleSwipe();
								}}
								onNope={() => {
									// storeAction("nopes", card);
									sendActionToAPI(card, "NOPE");
									handleSwipe();
								}}
								onSuperLike={() => {
									// storeAction("superLikes", card);
									sendActionToAPI(card, "SUPERLIKE");
									handleSwipe();
								}}
								sensitivity={sensitivity}
								zIndex={cards.length - index}
							>
								<motion.div
									className={`absolute ${isTop ? "hover:scale-[1.015]" : ""}`}
									style={{
										width: cardDimensions.width,
										height: cardDimensions.height,
										transform: `translateY(${translateY}px)`,
										scale: isTop ? 1 : scale,
										rotateZ: isTop ? 0 : rotation,
										pointerEvents: isTop ? "auto" : "none",
									}}
								>
									<div
										className={`rounded-3xl p-[3px] w-full h-full transition-all duration-300 ${isTop ? "snake-border" : "bg-transparent"
											}`}
									>
										<div className="rounded-2xl overflow-hidden w-full h-full bg-black/20 backdrop-blur-md">
											{renderCard ? renderCard(card) : <div>Missing card content</div>}
										</div>
									</div>
								</motion.div>
							</CardRotate>
						);
					})
				)}
			</div>

			{/* ✅ Match Popup */}
			<MatchPopup
				visible={showMatchPopup}
				user={matchUser}
				onClose={() => setShowMatchPopup(false)}
			/>
		</>
	);
}
