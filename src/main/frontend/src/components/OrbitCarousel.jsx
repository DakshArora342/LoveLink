import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaHeart, FaComments } from "react-icons/fa";
import { MdClose, MdReplay } from "react-icons/md";
import TriggerHearts from "../utils/TriggerHearts"; // ✅ import TriggerHearts


const cards = [
	{
		name: "Moksh Gupta",
		age: 20,
		branch: "BCA",
		image: "https://images.pexels.com/photos/7580994/pexels-photo-7580994.jpeg",
		tags: ["💻 Coding", "🎮 Gaming", "🎵 Music"],
	},
	{
		name: "Riya Sharma",
		age: 19,
		branch: "ECE",
		image: "https://photosnow.org/wp-content/uploads/2024/04/beautiful-girl-photo_13.jpg",
		tags: ["📚 Reading", "🧘 Yoga", "🎨 Art"],
	},
	{
		name: "Akshans Rai",
		age: 20,
		branch: "BCOM",
		image: "https://images.pexels.com/photos/30026767/pexels-photo-30026767.jpeg",
		tags: ["⚽ Football", "🎧 Music", "🎬 Movies"],
	},
	{
		name: "Neha Verma",
		age: 21,
		branch: "CSE",
		image: "https://images.pexels.com/photos/13585830/pexels-photo-13585830.jpeg",
		tags: ["📸 Photography", "🛍️ Shopping", "☕ Coffee"],
	},
	{
		name: "Krishna",
		age: 18,
		branch: "BBA",
		image: "https://images.pexels.com/photos/5888172/pexels-photo-5888172.jpeg",
		tags: ["🏏 Circket", "🎤 Singing", "📷 Content"],
	},
];

export default function OrbitCarousel() {
	const [angle, setAngle] = useState(0);
	const radius = 180;

	useEffect(() => {
		const interval = setInterval(() => {
			setAngle((prev) => prev + 0.6); // Controls speed of rotation
		}, 30);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className="relative h-[500px] w-full flex items-center justify-center overflow-hidden">
			<div className="relative w-[500px] h-[500px]">
				{cards.map((card, i) => {
					const theta = ((360 / cards.length) * i + angle) * (Math.PI / 180);
					const x = radius * Math.cos(theta);
					const z = radius * Math.sin(theta);
					const scale = 0.75 + 0.25 * ((z + radius) / (2 * radius));
					const opacity = 0.5 + 0.5 * ((z + radius) / (2 * radius));

					return (
						<TriggerHearts navigateTo="/auth" key={i}>
							{({ triggerHearts }) => (
								<motion.div
									onClick={triggerHearts}
									className="absolute top-1/2 left-1/2 origin-center cursor-pointer"
									style={{
										transform: `translate(-50%, -50%) translateX(${x}px) scale(${scale})`,
										zIndex: Math.floor(z),
										opacity,
									}}
									animate
								>
									<div className="w-[200px] bg-white rounded-xl overflow-hidden border-2 border-purple-400 shadow-[0_0_15px_3px_rgba(168,85,247,0.7),0_0_30px_10px_rgba(147,51,234,0.5)] transition duration-300">

										{/* 🖼️ Image */}
										<div className="h-[220px] overflow-hidden rounded-t-xl relative">
											<img
												src={card.image}
												alt={card.name}
												className="w-full h-full object-cover object-top"
											/>
											<div className="absolute inset-0 border-t-[4px] border-pink-400 blur-sm opacity-30 rounded-t-xl"></div>
										</div>

										{/* ℹ️ Details */}
										<div className="p-2 text-center bg-white">
											<h4 className="text-lg font-bold text-pink-700">
												{card.name}, {card.age}
											</h4>
											<p className="text-sm text-gray-500">{card.branch}</p>

											<div className="flex gap-1 mt-2 flex-wrap justify-center">
												{card.tags.map((tag, i) => (
													<span
														key={i}
														className="text-xs bg-pink-100 text-pink-600 px-2 py-[2px] rounded-full"
													>
														{tag}
													</span>
												))}
											</div>

											<div className="flex justify-around mt-3 text-pink-600 text-lg">
												<MdClose />
												<MdReplay />
												<FaHeart />
												<FaComments />
											</div>
										</div>
									</div>
								</motion.div>
							)}
						</TriggerHearts>
					);
				})}
			</div>
		</div>
	);
}
