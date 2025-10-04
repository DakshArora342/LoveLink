import { AlertTriangle } from "lucide-react";


export default function Maintenance() {


	return (
		<div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-pink-600 via-purple-700 to-black text-white z-50 p-6">
			<div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-lg text-center">
				<div className="flex justify-center mb-4">
					<AlertTriangle className="w-16 h-16 text-yellow-400" />
				</div>
				<h1 className="text-3xl font-bold mb-2">🚧 Maintenance Mode</h1>
				<p className="text-white/80 text-lg">
					{"We are collecting some data and doing maintenance. Please check back shortly."}
				</p>
				<p className="mt-6 text-sm text-white/50">Thanks for your patience 💖</p>
			</div>
		</div>
	);
}
