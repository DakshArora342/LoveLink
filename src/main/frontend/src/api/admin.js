import axiosInstance from "../utils/axios";

export const checkMaintenance = async () => {
	const res = await axiosInstance.get("/admin/public/maintenance");
	return res.data.maintenanceMode;
};

export const setMaintenance = async (enabled) => {
	await axiosInstance.post(`/admin/maintenance?enabled=${enabled}`);
};

export const banUser = async (userId) => {
	return axiosInstance.post(`/admin/users/${userId}/ban`);
};

export const unbanUser = async (userId) => {
	return axiosInstance.post(`/admin/users/${userId}/unban`);
};

export async function fetchUsersWithSearch({ query = "", gender = "all", status = "all", page = 0, size = 8 }) {
	const params = new URLSearchParams();

	if (query) params.append("query", query);
	if (gender !== "all") params.append("gender", gender);
	if (status !== "all") params.append("status", status);

	params.append("page", page);
	params.append("size", size);

	const response = await axiosInstance.get(`/admin/search?${params.toString()}`);
	return response.data;
}
