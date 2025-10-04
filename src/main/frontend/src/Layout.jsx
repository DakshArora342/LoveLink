// src/Layout.jsx
import BottomGlassNavbar from "./components/BottomNavBar";
import { Outlet } from "react-router-dom";

export default function Layout() {
	return (
		<div className="relative w-full h-screen overflow-hidden">


			{/* Main content */}
			<main className="h-full overflow-y-auto pt-4 pb-28 px-4">
				<Outlet />
			</main>

			{/* Navbar */}
			<BottomGlassNavbar />
		</div>
	);
}
