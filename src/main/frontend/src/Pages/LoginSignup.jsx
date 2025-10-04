import { useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer, Bounce } from "react-toastify";
import { motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";
import Lottie from "lottie-react";
import coupleAnimation from "../animations/couple.json";
import Iridescence from "../components/Iridescence";
import axiosInstance, { setUser } from "../utils/axios";
import Banned from "./Banned";
import Maintenance from "./Maintenance";
import { Eye, EyeOff } from "lucide-react";

// ✅ Memoized Lottie to prevent re-render on typing
const CoupleLottie = memo(() => (
	<Lottie animationData={coupleAnimation} loop className="w-28 mx-auto mb-4" />
));

export default function LoginSignup() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isResendingOtp, setIsResendingOtp] = useState(false);
	const [isOtpSending, setIsOtpSending] = useState(false);

	const [resetOtp, setResetOtp] = useState("");
	const [resettingPassword, setResettingPassword] = useState(false);

	const [isLogin, setIsLogin] = useState(true);
	const [form, setForm] = useState({ name: "", email: "", password: "" });
	const [otpPhase, setOtpPhase] = useState(false);
	const [enteredOtp, setEnteredOtp] = useState("");
	const [forgotMode, setForgotMode] = useState(false);
	const [newPassword, setNewPassword] = useState("");

	const [isBanned, setIsBanned] = useState(false);
	const [isMaintenance, setIsMaintenance] = useState(false);

	const [showPassword, setShowPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);

	const navigate = useNavigate();

	const handleChange = (e) =>
		setForm({ ...form, [e.target.name]: e.target.value });

	// ✅ Password validation: at least 1 capital, 1 number, 1 symbol
	const validatePassword = (pass) =>
		/[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[!@#$%^&*]/.test(pass);

	// 🟢 Handle login/signup/forgot
	const handleSubmit = async (e) => {
		e.preventDefault();
		const { name, email, password } = form;

		if (!email || (!isLogin && !password)) {
			toast.error("Please fill all fields", { toastId: "auth-toast" });
			return;
		}


		try {
			if (forgotMode) {
				if (!form.email) {
					toast.error("Please enter your email.");
					return;
				}
				setIsOtpSending(true);
				try {
					await axiosInstance.post("/users/forgot-password", { email: form.email });
					setResettingPassword(true);
					toast.info("OTP sent to your email.");
				} catch (error) {
					const message =
						error.response?.data?.message ||
						(typeof error.response?.data === "string"
							? error.response.data
							: null) ||
						error.message ||
						"Something went wrong.";
					toast.error(message, { toastId: "auth-toast" });
				} finally {
					setIsOtpSending(false);
				}
				return;
			}

			if (!isLogin) {
				if (!validatePassword(password)) {
					toast.error(
						"Password must have 1 capital, 1 symbol, 1 number",
						{ toastId: "auth-toast" }
					);
					return;
				}
				setIsSubmitting(true); // ✅ Add this line
				try {
					await axiosInstance.post("/users", { name, email, password });
					setOtpPhase(true);
					setEnteredOtp("");
					// toast.info("OTP sent to your email");
				} catch (err) {
					toast.error(err.response?.data || "Signup error", {
						toastId: "auth-toast",
					});
				} finally {
					setIsSubmitting(false); // ✅ Add this line
				}
				return;
			}

			else {
				// Login flow
				try {
					const res = await axiosInstance.post("/users/login", { email, password });
					setUser(res.data.user.id);
					toast.success("Logged in!");
					setTimeout(() => navigate("/browse"), 1000);
				} catch (err) {
					if (err.response?.status === 401) {
						const message = err.response?.data;
						if (message === "Account not verified") {
							toast.info("Account not verified. OTP has been sent to your email.");
							setOtpPhase(true);
							setEnteredOtp("");
							return;
						}
						if (message === "Incorrect password") {
							toast.error("Incorrect password");
							return;
						}
						toast.error(message || "Login failed", { toastId: "auth-toast" });
						return;
					} else if (err.response?.status === 403) {
						setIsBanned(true);
						return;
					} else if (err.response?.status === 503) {
						setIsMaintenance(true);
						return;
					}
					toast.error(err.response?.data || "Login error", { toastId: "auth-toast" });
				}
			}
		} catch (err) {
			toast.error(err.response?.data || "Signup error", { toastId: "auth-toast" });
		}
	};

	// 🟢 OTP verification
	const handleOtpVerification = async () => {
		try {
			const res = await axiosInstance.post("/users/verify-otp", {
				email: form.email,
				otp: enteredOtp,
			});
			setUser(res.data.user.id);
			toast.success("OTP verified!", { toastId: "auth-toast" });
			setTimeout(() => navigate("/profile-setup"), 1000);
		} catch {
			toast.error("Invalid OTP", { toastId: "auth-toast" });
		}
	};


	// 🛑 Special screens
	if (isBanned) return <Banned />;
	if (isMaintenance) return <Maintenance />;

	// 🟣 OTP screen
	if (otpPhase) {
		return (
			<AuthWrapper>
				<motion.div
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.5 }}
					className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8"
				>
					<h2 className="text-2xl font-bold text-center text-white mb-6">Verify OTP</h2>
					<input
						type="text"
						placeholder="Enter OTP"
						value={enteredOtp}
						onChange={(e) => setEnteredOtp(e.target.value)}
						className="w-full mb-4 p-3 rounded-xl bg-white text-black placeholder-black outline-none"
					/>
					<button
						onClick={handleOtpVerification}
						className="w-full py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition"
					>
						Verify OTP
					</button>
					<div className="text-sm text-white/80 text-center mt-3">
						Didn’t receive OTP?{" "}



						<span
							className={`underline cursor-pointer text-rose-300 ${isResendingOtp ? "opacity-50 pointer-events-none" : ""
								}`} // ✅ Add this to disable and dim the text
							onClick={async () => {
								if (isResendingOtp) return;
								setIsResendingOtp(true);
								try {
									await axiosInstance.post("/users/resend-otp", { email: form.email });
									toast.success("OTP resent!");
								} catch {
									toast.error("Failed to resend OTP");
								} finally {
									setIsResendingOtp(false);
								}
							}}
						>
							{isResendingOtp ? "Resending..." : "Resend OTP"} {/* ✅ Dynamic label */}
						</span>


					</div>
				</motion.div>
			</AuthWrapper>
		);
	}

	// 🟢 Login / Signup / Forgot / Reset screen
	return (
		<AuthWrapper>
			<motion.div
				initial={{ scale: 0.95, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ duration: 0.5 }}
				className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8"
			>
				<CoupleLottie />
				<h2 className="text-3xl font-bold text-center text-white mb-6">
					{isLogin ? "Welcome Back 💘" : "Create Your Love-Link 💕"}
				</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					<motion.input
						type="email"
						name="email"
						value={form.email}
						onChange={handleChange}
						placeholder="Email"
						className="w-full p-3 rounded-xl bg-white text-black placeholder-black outline-none focus:ring-2 focus:ring-pink-500"
					/>

					{!forgotMode && (
						<PasswordInput
							value={form.password}
							onChange={handleChange}
							showPassword={showPassword}
							setShowPassword={setShowPassword}
						/>
					)}



					<motion.button
						type="submit"
						className="w-full py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition"
						disabled={isOtpSending || isSubmitting} // ✅ Add isSubmitting
					>
						{isOtpSending
							? "Sending OTP..."
							: isSubmitting
								? isLogin
									? "Logging in..."
									: "Registering..." // ✅ Custom text while submitting
								: isLogin
									? forgotMode
										? "Send OTP"
										: "Login"
									: "Sign Up"}
					</motion.button>


					{isLogin && !forgotMode && (
						<div
							className="text-sm text-white/90 cursor-pointer text-right hover:underline"
							onClick={() => setForgotMode(true)}
						>
							Forgot Password?
						</div>
					)}

					{/* Reset password phase */}
					{resettingPassword && (
						<>
							<motion.input
								type="text"
								placeholder="Enter OTP"
								value={resetOtp}
								onChange={(e) => setResetOtp(e.target.value)}
								className="w-full p-3 rounded-xl bg-white text-black placeholder-black outline-none"
							/>
							<PasswordInput
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								showPassword={showNewPassword}
								setShowPassword={setShowNewPassword}
								placeholder="New Password"
							/>
							<motion.button
								type="button"
								className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
								disabled={isSubmitting}
								onClick={async () => {
									if (isSubmitting) return;
									setIsSubmitting(true);
									if (!resetOtp || !newPassword) {
										toast.error("Please fill all fields.");
										setIsSubmitting(false);
										return;
									}
									if (!validatePassword(newPassword)) {
										toast.error("Password must have 1 capital, 1 symbol, 1 number");
										setIsSubmitting(false);
										return;
									}
									try {
										await axiosInstance.post("/users/reset-password", {
											email: form.email,
											otp: resetOtp,
											newPassword,
										});
										toast.success("Password reset successful.");
										setForgotMode(false);
										setResettingPassword(false);
										setForm({ ...form, password: "" });
									} catch (err) {
										toast.error(err.response?.data || "Reset failed.");
									} finally {
										setIsSubmitting(false);
									}
								}}
							>
								Reset Password
							</motion.button>
						</>
					)}
				</form>

				<div className="text-center mt-5 text-sm text-white/80">
					{isLogin ? "New here?" : "Already have an account?"}{" "}
					<span
						className="text-rose-300 cursor-pointer font-semibold hover:underline"
						onClick={() => {
							setIsLogin(!isLogin);
							setForgotMode(false);
							setResettingPassword(false);
							setForm({ name: "", email: "", password: "" });
						}}
					>
						{isLogin ? "Sign Up" : "Login"}
					</span>
				</div>
			</motion.div>
		</AuthWrapper>
	);
}

/* 🔹 Helper Components */

// Wrapper with animated background
function AuthWrapper({ children }) {
	return (
		<div className="relative min-h-screen w-full overflow-hidden">
			<div className="fixed inset-0 -z-10">
				<Iridescence color={[0.4, 0.1, 0.5]} speed={1} amplitude={0.1} mouseReact={false} />
			</div>
			<ToastContainer position="top-right" autoClose={3000} transition={Bounce} theme="light" />
			<div className="relative z-10 max-h-screen overflow-y-auto px-4 pt-20 pb-10">
				{children}
			</div>
		</div>
	);
}

// ✅ Password input with toggle eye visible only if typing
const PasswordInput = memo(function PasswordInput({
	value,
	onChange,
	showPassword,
	setShowPassword,
	placeholder = "Password",
}) {
	return (
		<div className="relative">
			<input
				type={showPassword ? "text" : "password"}
				name="password"
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				className="w-full p-3 rounded-xl bg-white text-black placeholder-black outline-none focus:ring-2 focus:ring-pink-500 pr-10"
			/>
			{value && (
				<span
					className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-600"
					onClick={() => setShowPassword(!showPassword)}
				>
					{showPassword ? <EyeOff size={24} strokeWidth={2.4} /> : <Eye size={24} strokeWidth={2.4} />}
				</span>
			)}
		</div>
	);
});
