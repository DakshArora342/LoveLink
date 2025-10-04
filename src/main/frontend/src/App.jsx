import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import WelcomePage from "./Pages/WelcomePage";
import FeaturesPage from "./Pages/FeaturesPage";
import LoginSignup from "./Pages/LoginSignup";
import ProfileSetup from "./Pages/ProfileSetup/ProfileSetup";
import Browse from "./Pages/Browse";
import Random from "./Pages/Random";
import Likes from "./Pages/Likes";
import Chat from "./Pages/Chat";
import Profile from "./Pages/Profile";
import MatchesPage from "./Pages/Matches";
import Layout from "./Layout";


import AdminDashboard from "./Pages/Admin/AdminDashboard";
import UserGuard from "./Guards/UserGuard";
import UsersPage from "./Pages/Admin/UsersPage";
import BannedPage from "./Pages/Admin/BannedPage";
import ReportsPage from "./Pages/Admin/ReportsPage";
import Banned from "./Pages/Banned";

import AdminGuard from "./Guards/AdminGuard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Maintenance from "./Pages/Maintenance";
import NotFound from "./components/NotFound";
import { getUser } from "./utils/axios";

import PWAInstallPrompt from "./components/PWAInstallPrompt";

import Iridescence from "./components/Iridescence"; // ✅ global background
// import { ensureCsrfToken } from "./utils/csrf";

function AppRoutes() {
	const location = useLocation();
	const user = getUser();

	return (
		<Routes>
			{/* Root redirect if user logged in */}
			<Route
				path="/"
				element={
					user && location.pathname === "/" ? (
						<Navigate to="/browse" replace />
					) : (
						<WelcomePage />
					)
				}
			/>

			{/* Public Pages */}
			<Route path="/features" element={<FeaturesPage />} />
			<Route path="/auth" element={<LoginSignup />} />
			<Route path="/profile-setup" element={<ProfileSetup />} />

			{/* Protected User Routes */}
			<Route element={<UserGuard />}>
				<Route element={<Layout />}>
					<Route path="/browse" element={<Browse />} />
					<Route path="/random" element={<Random />} />
					<Route path="/likes" element={<Likes />} />
					<Route path="/chat" element={<Chat />} />
					<Route path="/profile" element={<Profile />} />
					<Route path="/matches" element={<MatchesPage />} />
				</Route>
			</Route>

			{/* Admin Routes */}
			<Route element={<AdminGuard />}>
				<Route path="/admin/*" element={<AdminDashboard />}>
					<Route path="users" element={<UsersPage />} />
					<Route path="banned" element={<BannedPage />} />
					<Route path="reports" element={<ReportsPage />} />
					<Route index element={<Navigate to="users" replace />} />
				</Route>
			</Route>

			{/* Other Pages */}
			<Route path="/banned" element={<Banned />} />
			<Route path="/maintenance" element={<Maintenance />} />

			{/* Fallback */}
			<Route path="*" element={<NotFound />} />
		</Routes>
	);
}

function App() {
	return (
		<div className="relative w-full h-screen overflow-hidden">
			{/* ✅ Global background once */}
			<div className="fixed inset-0 -z-10">
				<Iridescence
					color={[0.4, 0.1, 0.5]}
					speed={1}
					amplitude={0.1}
					mouseReact={false}
				/>
			</div>

			{/* Routes */}
			<AppRoutes />

			{/* Global components */}

			<ToastContainer position="top-center" autoClose={2000} />
			<PWAInstallPrompt />
		</div>
	);
}

export default App;
