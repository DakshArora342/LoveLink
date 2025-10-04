import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchUser } from "../utils/axios";
import Loading from "../components/Loading";
import logger from "../utils/logger";

export default function AdminGuard() {
	const [isLoading, setIsLoading] = useState(true);
	const [isAdmin, setIsAdmin] = useState(false);

	useEffect(() => {
		const loadProfile = async () => {
			try {
				const data = await fetchUser();

				if (data?.isAdmin) {
					setIsAdmin(true);
				}
			} catch (err) {
				logger.error(err);
				// console.error("Error loading profile:", err);
			} finally {
				setIsLoading(false);
			}
		};

		loadProfile();
	}, []);

	if (isLoading) return <Loading />;

	return isAdmin ? <Outlet /> : <Navigate to="/auth" replace />;
}
