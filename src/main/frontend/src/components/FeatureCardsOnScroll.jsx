import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FaComments, FaUserSecret, FaLock, FaRandom } from "react-icons/fa";
import TriggerHearts from "../utils/TriggerHearts"; // ✅ import added

function FeatureCardsOnScroll() {
	const ref = useRef(null);
	const isInView = useInView(ref, { amount: 0.4 });

	const features = [
		{
			icon: <FaComments />,
			title: "Chat Freely",
			desc: "Start chatting with matches. Chat time limits for free users.",
		},
		{
			icon: <FaUserSecret />,
			title: "Anonymous Chat",
			desc: "Chat without revealing your identity!",
		},
		{
			icon: <FaLock />,
			title: "End-to-End Encryption",
			desc: "Your messages are safe and private with military-grade encryption.",
		},
		{
			icon: <FaRandom />,
			title: "Smart Matching",
			desc: "Get matched automatically by year, branch & interests.",
		},
	];

	return (
		<motion.div
			ref={ref}
			initial={{ opacity: 0.2 }}
			animate={{ opacity: isInView ? 1 : 0.2 }}
			transition={{ duration: 0.6 }}
			className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-opacity"
		>
			{features.map((feature, index) => (
				<TriggerHearts navigateTo="/auth" key={index}>
					{({ triggerHearts }) => (
						<motion.div
							onClick={triggerHearts}
							className="bg-black/50 text-white backdrop-blur-xl rounded-xl p-6 flex flex-col items-center cursor-pointer border border-purple-500 shadow-[0_0_20px_rgba(126,34,206,0.3)] hover:scale-105 transition-transform duration-300"
							initial={{ opacity: 0, y: 40 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.15, duration: 0.6 }}
						>
							<div className="text-4xl text-fuchsia-300 mb-3">
								{feature.icon}
							</div>
							<h3 className="text-xl font-semibold text-white mb-2">
								{feature.title}
							</h3>
							<p className="text-sm text-gray-200">{feature.desc}</p>
						</motion.div>
					)}
				</TriggerHearts>
			))}
		</motion.div>
	);
}

export default FeatureCardsOnScroll;
