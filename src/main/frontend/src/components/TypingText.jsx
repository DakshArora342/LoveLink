// components/TypingText.jsx
import { useEffect, useRef, useState } from "react";

const userTypes = [
	"Lover 💘",
	"Secret Admirer 🕵️‍♂️",
	"Romantic Soul 🌹",
];

export default function TypingText() {
	const [text, setText] = useState("");
	const i = useRef(0);
	const j = useRef(0);
	const isDeleting = useRef(false);

	useEffect(() => {
		const interval = setInterval(() => {
			const word = userTypes[i.current % userTypes.length];

			if (isDeleting.current) {
				j.current--;
				setText(word.substring(0, j.current));
				if (j.current <= 0) {
					isDeleting.current = false;
					i.current++;
				}
			} else {
				j.current++;
				setText(word.substring(0, j.current));
				if (j.current >= word.length) {
					isDeleting.current = true;
				}
			}
		}, isDeleting.current ? 40 : 100);

		return () => clearInterval(interval);
	}, []);

	return (
		<span className="drop-shadow-md">
			{text}
			<span className="animate-pulse">|</span>
		</span>
	);
}
