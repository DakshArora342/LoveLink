import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance, { getUser } from "../utils/axios";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { FiArrowLeft } from "react-icons/fi";
import Loading from "../components/Loading";
import logger from "../utils/logger";

// ---- helpers -------------------------------------------------------------

const easeInOutQuad = (t) =>
	t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

const smoothScrollTo = (el, to, duration = 650) => {
	if (!el) return;
	const start = el.scrollTop;
	const change = to - start;
	const startTime = performance.now();

	const animate = (now) => {
		const elapsed = now - startTime;
		const progress = Math.min(1, elapsed / duration);
		el.scrollTop = start + change * easeInOutQuad(progress);
		if (progress < 1) requestAnimationFrame(animate);
	};
	requestAnimationFrame(animate);
};

const sortByTime = (arr) =>
	[...arr].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

const isNearBottom = (el, threshold = 120) =>
	el ? el.scrollHeight - el.scrollTop - el.clientHeight < threshold : false;

// -------------------------------------------------------------------------

export default function Chat({ myUserId }) {
	const [params] = useSearchParams();
	const navigate = useNavigate();
	const userId = params.get("user");
	myUserId = getUser();

	const [matches, setMatches] = useState([]);
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const [showMatchList, setShowMatchList] = useState(!userId);
	const [previewProfile, setPreviewProfile] = useState(null);
	const [ready, setReady] = useState(false);
	const [loading, setLoading] = useState(false);

	const chatRef = useRef(null);
	const stompClientRef = useRef(null);

	// fetch matches
	useEffect(() => {
		const fetchMatches = async () => {
			try {
				const res = await axiosInstance.get("actions/matches?page=0&size=20");
				const data = res.data.content;
				const transformed = data.map((p) => ({
					id: p.id,
					name: p.name,
					age: p.age,
					bio: p.about || "",
					images: (p.photos || []).map((photo) => {
						if (photo.base64?.startsWith("data:image")) return photo.base64;
						if (photo.base64) return `data:image/jpeg;base64,${photo.base64}`;
						return photo.url;
					}),
				}));
				setMatches(transformed);
			} catch (err) {
				logger.error(err);
			 }
		};
		fetchMatches();
	}, []);

	useEffect(() => {
		setShowMatchList(!userId);
		setReady(true);
	}, [userId]);

	// WebSocket
	useEffect(() => {
		if (!myUserId) return;

		const socket = new SockJS(
			"https://love-link-1759327457370.azurewebsites.net/ws-chat"
			// "http://localhost:8081/ws-chat"
		);
		const stompClient = new Client({
			webSocketFactory: () => socket,
			reconnectDelay: 5000,
			onConnect: () => {
				stompClient.subscribe(`/topic/${myUserId}`, (msg) => {
					const msgBody = JSON.parse(msg.body);
					const incoming = {
						text: msgBody.content,
						sender: "them",
						timestamp: msgBody.timestamp || new Date().toISOString(),
					};

					setMessages((prev) => sortByTime([...prev, incoming]));

					// only scroll if user is near bottom
					if (isNearBottom(chatRef.current)) {
						smoothScrollTo(
							chatRef.current,
							chatRef.current.scrollHeight,
							700
						);
					}
				});
			},
		});

		stompClient.activate();
		stompClientRef.current = stompClient;
		return () => stompClient.deactivate();
	}, [myUserId]);

	// fetch full history (load until no more pages)
	const fetchFullHistory = async () => {
		if (!userId) return;
		let allMsgs = [];
		let page = 0;
		let last = false;

		while (!last) {
			try {
				const res = await axiosInstance.get("/chat/history", {
					params: {
						user1: String(myUserId),
						user2: String(userId),
						page,
						size: 20,
					},
				});

				const pageMsgs = res.data.content.map((m) => ({
					text: m.content,
					timestamp: m.timestamp,
					sender: m.senderId === String(myUserId) ? "me" : "them",
				}));

				allMsgs = [...allMsgs, ...pageMsgs];
				last = res.data.last;
				page++;
			} catch (err) {
				logger.error(err);
				break;
			}
		}

		setMessages(sortByTime(allMsgs));

		// scroll to bottom once chat is loaded
		setTimeout(() => {
			smoothScrollTo(chatRef.current, chatRef.current.scrollHeight, 700);
		}, 100);
	};

	// reset on user change → fetch full history
	useEffect(() => {
		setMessages([]);
		fetchFullHistory();
	}, [userId, myUserId]);

	// send message
	const handleSend = () => {
		if (!input.trim() || !userId) return;
		const content = input.trim();
		const now = new Date().toISOString();

		const myMsg = { text: content, sender: "me", timestamp: now };
		setMessages((prev) => sortByTime([...prev, myMsg]));
		setInput("");

		smoothScrollTo(chatRef.current, chatRef.current.scrollHeight, 700);

		const msgObj = {
			senderId: String(myUserId),
			receiverId: String(userId),
			content,
		};

		stompClientRef.current?.publish({
			destination: "/app/send",
			body: JSON.stringify(msgObj),
		});
	};

	if (!ready) return null;

	if (showMatchList) {
		return (
			<div className="relative min-h-screen px-4 pt-20 pb-32 bg-transparent backdrop-blur-md text-white overflow-y-auto">
				<h2 className="text-2xl font-bold text-center text-white mb-6 flex items-center justify-center gap-2">
					<span className="text-pink-400">💬</span> Chats
				</h2>

				{matches.length === 0 ? (
					<p className="text-center text-white/70">No matches yet 😢</p>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{matches.map((m) => (
							<div
								key={m.id}
								className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 cursor-pointer hover:bg-white/20 transition"
								onClick={() => {
									navigate(`/chat?user=${m.id}`);
									setShowMatchList(false);
								}}
							>
								<img
									src={m.images?.[0]}
									alt={m.name}
									className="w-16 h-16 rounded-full object-cover border-2 border-pink-400"
								/>
								<div className="flex-1">
									<h3 className="font-bold text-lg text-white">
										{m.name}, {m.age}
									</h3>
									<p className="text-sm text-white/70 flex items-center gap-1">
										Tap to chat <span>💬</span>
									</p>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		);
	}


	const matchedUser = matches.find((u) => u.id === userId);

	return (
		<div className="fixed inset-0 flex flex-col px-4 pt-5 pb-[90px] bg-transparent text-gray-800">
			{/* Header */}
			<div className="flex items-center gap-4 mb-4 bg-white/20 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/30">
				<button
					onClick={() => {
						setShowMatchList(true);
						navigate("/chat");
					}}
					className="p-1 rounded-full"
				>
					<FiArrowLeft className="w-6 h-6 text-pink-600" />
				</button>
				<img
					src={matchedUser?.images?.[0]}
					alt=""
					className="w-12 h-12 rounded-full object-cover border-2 border-pink-400"
					onClick={() => setPreviewProfile(matchedUser)}
				/>
				<div>
					<h2 className="font-bold text-lg text-pink-600">
						{matchedUser?.name}, {matchedUser?.age}
					</h2>
					<p className="text-sm text-white/80">{matchedUser?.bio}</p>
				</div>
			</div>

			{/* Chat list */}
			<div
				ref={chatRef}
				className="flex-1 overflow-y-scroll bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-2 scroll-smooth"
				style={{
					WebkitOverflowScrolling: "touch",
					overscrollBehavior: "contain",
				}}
			>
				{loading && (
					<div className="text-center text-white/50 text-sm mb-3">
						<Loading />
					</div>
				)}

				{messages.length === 0 && !isTyping && (
					<p className="text-center text-white/60">Start chatting now!</p>
				)}

				{messages.map((msg, i) => (
					<div
						key={i}
						className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"
							} mb-2`}
					>
						<div className="max-w-[70%]">
							<div
								className={`px-4 py-2 rounded-xl text-sm ${msg.sender === "me"
										? "bg-pink-500 text-white"
										: "bg-white/90 text-gray-800"
									}`}
							>
								{msg.text}
							</div>
							<div className="text-[10px] text-white/60 mt-1 ml-1">
								{new Date(msg.timestamp).toLocaleString("en-GB", {
									day: "2-digit",
									month: "2-digit",
									year: "numeric",
									hour: "2-digit",
									minute: "2-digit",
									hour12: false,
								})}
							</div>
						</div>
					</div>
				))}

				{isTyping && (
					<div className="flex justify-start mb-2">
						<div className="px-4 py-2 rounded-xl text-sm bg-white/80 text-gray-600 animate-pulse">
							typing...
						</div>
					</div>
				)}
			</div>

			{/* Input row with extra bottom padding */}
			<div className="flex items-center gap-3 mt-3 w-full px-1 pb-4">
				<input
					type="text"
					placeholder="Type a message..."
					className="flex-1 px-4 py-3 rounded-full bg-white/80 text-sm sm:text-base focus:outline-none"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleSend()}
				/>

				<button
					onClick={handleSend}
					className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full flex items-center justify-center min-w-[80px]"
				>
					Send
				</button>
			</div>

			{/* Preview modal */}
			{previewProfile && (
				<div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
					<div className="bg-white rounded-xl p-6 max-w-md w-full relative">
						<button
							onClick={() => setPreviewProfile(null)}
							className="absolute top-2 right-2 text-black hover:text-pink-600 transition"
						>
							✖
						</button>
						<img
							src={previewProfile.images?.[0]}
							alt=""
							className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-pink-400 object-cover"
						/>
						<h2 className="text-xl font-bold text-center text-pink-600">
							{previewProfile.name}, {previewProfile.age}
						</h2>
						<p className="text-center text-gray-600">
							{previewProfile.bio}
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
