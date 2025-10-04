import axios from "axios";
import { toast } from "react-toastify";
import logger from "./logger";

const BASE_URL = "https://love-link-1759327457370.azurewebsites.net/api";

// const BASE_URL = "http://localhost:8081/api";

const axiosInstance = axios.create({
	baseURL: BASE_URL,
	withCredentials: true, // Important for sending cookies
});


// ====================================================================
// NEW: Lines to add right after you create axiosInstance
// These variables manage the token refresh process to prevent race conditions.
// ====================================================================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
	failedQueue.forEach(prom => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};
// ====================================================================
// END OF NEW SECTION
// ====================================================================


// ====================================================================
// REPLACED: Your entire old interceptors.response block is replaced with this new one.
// ====================================================================
axiosInstance.interceptors.response.use(
	(response) => {
		// This part for handling success remains the same
		const method = response.config.method?.toLowerCase();
		const url = response.config.url;
		if (method !== "get") {
			if (url.includes("/user-profiles") && method === "post") {
				// toast.success("Profile created successfully!");
			} else if (url.includes("/image") && method === "delete") {
				// toast.success("Image deleted.");
			} else {
				// toast.success("Action completed successfully.");
			}
		}
		return response;
	},
	async (error) => {
		const originalRequest = error.config;

		// Determine if the request should be retried based on status code
		const shouldRetry =
			(error.response?.status === 403 || error.response?.status === 503) &&
			!originalRequest._retry &&
			!originalRequest.url.includes("/login") &&
			!originalRequest.url.includes("/verify-otp") &&
			!originalRequest.url.includes("/users/refresh");

		if (!shouldRetry) {
			// For errors we don't handle with a retry, just show the error and stop
			const message = error.response?.data?.message || error.response?.data || error.message || "Something went wrong.";
			toast.error(message, { toastId: `auth-error-${originalRequest.url}` });
			return Promise.reject(error);
		}

		// If a refresh is already in progress, add this request to a queue to be retried later
		if (isRefreshing) {
			return new Promise((resolve, reject) => {
				failedQueue.push({ resolve, reject });
			})
				.then(() => {
					return axiosInstance(originalRequest); // Retry request after token is refreshed
				})
				.catch(err => {
					logger.error(err);
					return Promise.reject(err); // If refresh fails, reject the queued request
				});
		}

		// If we get here, this is the first failed request. Time to refresh the token.
		originalRequest._retry = true;
		isRefreshing = true;

		try {
			// Send the request to get a new token
			await axios.post(`${BASE_URL}/users/refresh`, {}, { withCredentials: true });

			// Refresh was successful. Now, process every request that was waiting in the queue.
			processQueue(null);

			// Finally, retry the original request that triggered the refresh
			return axiosInstance(originalRequest);

		} catch (refreshError) {
			// The refresh attempt failed. All hope is lost.
			processQueue(refreshError); // Reject all queued requests

			const message = refreshError.response?.data;

			// Handle specific logout scenarios based on the error message from the /refresh endpoint
			if (
				refreshError.response?.status === 401 && typeof message === "string" &&
				["No refresh token", "Missing token ID", "Invalid refresh token", "Invalid or expired refresh token"]
					.some(msg => message.includes(msg))
			) {
				clearAuth();
				window.location.href = "/auth";
				return Promise.reject(refreshError);
			}

			if (
				refreshError.response?.status === 403 && typeof message === "string" && message.includes("User is banned")
			) {
				clearAuth();
				window.location.href = "/banned";
				return Promise.reject(refreshError);
			}

			// For any other refresh failure, assume the session is invalid and log out
			clearAuth();
			window.location.href = "/auth";
			toast.error("Your session has expired. Please log in again.", { toastId: "session-expired-toast" });

			return Promise.reject(refreshError);
		} finally {
			// Whether the refresh succeeded or failed, reset the flag
			isRefreshing = false;
		}
	}
);
// ====================================================================
// END OF REPLACED SECTION
// ====================================================================


// All your helper functions below this line remain exactly the same. No changes needed.
export const setUser = (user) => {
	if (user) {
		localStorage.setItem("user", JSON.stringify(user));
	}
};

export const getUser = () => {
	const userStr = localStorage.getItem("user");
	return userStr ? JSON.parse(userStr) : null;
};

export const clearAuth = () => {
	// We no longer manage accessToken in this file, so only remove user
	localStorage.removeItem("accessToken"); // Keep this for cleanup from old versions
	localStorage.removeItem("user");
};

export const fetchProfile = async () => {
	try {
		const response = await axiosInstance.get(`/user-profiles/${getUser()}`);
		return response.data;
	} catch (error) {
		// Error will be handled by the interceptor
		logger.error(err);
	}
};

export const fetchUser = async () => {
	try {
		const response = await axiosInstance.get(`/users/${getUser()}`);
		return response.data;
	} catch (error) {
		// Error will be handled by the interceptor
		logger.error(err);
	}
};

export default axiosInstance;