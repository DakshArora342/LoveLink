
import { FiAlertCircle } from "react-icons/fi";

export default function Banned() {


	return (
		<div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-6 text-center">
			<FiAlertCircle size={64} className="text-red-500 mb-4" />
			<h1 className="text-3xl font-bold mb-2">Access Denied</h1>
			<p className="text-white/70 mb-6">
				Your account has been <span className="text-red-400">banned</span>. Please contact support for assistance.
			</p>

		</div>
	);
}
