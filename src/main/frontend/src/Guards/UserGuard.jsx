import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchUser, getUser, clearAuth } from "../utils/axios";
import { checkMaintenance } from "../api/admin";
import Banned from "../Pages/Banned";
import Loading from "../components/Loading";
import logger from "../utils/logger";

export default function UserGuard() {
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isBanned, setIsBanned] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);
	const [maintenanceMode, setMaintenanceMode] = useState(false);

	useEffect(() => {
		const verifyUser = async () => {
			const storedUser = getUser();

			// No user stored (not logged in)
			if (!storedUser) {
				setIsAuthenticated(false);
				setIsLoading(false);
				return;
			}

			try {
				const [userData, isMaintenance] = await Promise.all([
					fetchUser(),        // your current user API
					checkMaintenance(), // new call
				]);

				setMaintenanceMode(isMaintenance);

				if (userData?.isBanned) {
					setIsBanned(true);
				} else if (userData?.isVerified) {
					setIsAuthenticated(true);
				}

				// Capture admin role (you can change the check if it's different)
				if (userData?.role === "ADMIN") {
					setIsAdmin(true);
				}

			} catch (error) {
				// console.error("Failed to verify user", error);
				logger.error(error);
				clearAuth();
			} finally {
				setIsLoading(false);
			}
		};

		verifyUser();
	}, []);

	if (isLoading) return <Loading />;

	return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />;
}
