import { checkMaintenance, setMaintenance } from "../api/admin";
import { useEffect, useState } from "react";
import logger from "../utils/logger";

export default function MaintenanceToggle() {
	const [enabled, setEnabled] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchStatus = async () => {
			try {
				const status = await checkMaintenance();
				setEnabled(status);
			} catch (err) {
				logger.error(err);
				// console.error("Failed to fetch maintenance mode status", err);
			} finally {
				setLoading(false);
			}
		};
		fetchStatus();
	}, []);

	const toggle = async () => {
		try {
			await setMaintenance(!enabled);
			setEnabled(!enabled);
		} catch (err) {
			logger.error(err);
			// console.error("Failed to toggle maintenance mode", err);
		}
	};

	if (loading) return null;

	return (
		<div className="mb-6">
			<label className="flex items-center gap-3 cursor-pointer">
				<span className="text-white font-medium">Maintenance Mode: {enabled ? "ON" : "OFF"}</span>
				<div
					onClick={toggle}
					className={`w-14 h-7 flex items-center rounded-full p-1 duration-300 ${enabled ? "bg-pink-500" : "bg-white/30"}`}
				>
					<div
						className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ${enabled ? "translate-x-7" : "translate-x-0"}`}
					></div>
				</div>
			</label>
		</div>
	);
}
