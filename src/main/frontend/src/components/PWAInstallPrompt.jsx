import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function PWAInstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] = useState(null);
	const [show, setShow] = useState(false);

	useEffect(() => {
		const dismissed = localStorage.getItem("pwa_prompt_dismissed");
		if (dismissed) return; // 🚫 Don't show if user dismissed before

		const handler = (e) => {
			e.preventDefault();
			setDeferredPrompt(e);
			setShow(true);
		};

		window.addEventListener("beforeinstallprompt", handler);
		return () => window.removeEventListener("beforeinstallprompt", handler);
	}, []);

	const handleInstall = async () => {
		if (!deferredPrompt) return;
		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === "accepted") {
			console.log("✅ App installed");
		}
		setDeferredPrompt(null);
		setShow(false);
	};

	const handleDismiss = () => {
		setShow(false);
		localStorage.setItem("pwa_prompt_dismissed", "true"); // 🔒 Remember dismissal
	};

	return (
		show && (
			<div className="fixed bottom-5 left-5 right-5 
        bg-white/10 backdrop-blur-md border border-white/20 
        text-white rounded-2xl p-4 shadow-lg 
        flex justify-between items-center z-50 gap-3">

				<span className="text-sm font-medium drop-shadow flex-1">
					✨ Install Love-Link on your phone
				</span>

				<div className="flex gap-2 items-center">
					<button
						onClick={handleInstall}
						className="bg-white/30 backdrop-blur-sm border border-white/20 
              text-white font-semibold px-4 py-1.5 rounded-xl 
              hover:bg-white/40 transition"
					>
						Install
					</button>

					{/* ❌ Close Button */}
					<button
						onClick={handleDismiss}
						className="p-2 rounded-full hover:bg-white/20 transition"
					>
						<X size={18} />
					</button>
				</div>
			</div>
		)
	);
}
