package com.lovelink.security;

import java.util.Map;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

	private final JwtUtil jwtUtil;

	public JwtHandshakeInterceptor(JwtUtil jwtUtil) {
		this.jwtUtil = jwtUtil;
	}

	@Override
	public boolean beforeHandshake(ServerHttpRequest request,
			org.springframework.http.server.ServerHttpResponse response, WebSocketHandler wsHandler,
			Map<String, Object> attributes) {

		if (request instanceof ServletServerHttpRequest servletRequest) {
			HttpServletRequest httpRequest = servletRequest.getServletRequest();

			Cookie[] cookies = httpRequest.getCookies();
			if (cookies != null) {
				for (Cookie cookie : cookies) {
					if ("accessToken".equals(cookie.getName())) {
						String token = cookie.getValue();
						try {
							var claims = jwtUtil.parseClaims(token);
							String userId = claims.getSubject();
							attributes.put("userId", userId); // ✅ Save userId for use in ChatService
							return true;
						} catch (Exception e) {
							log.error("Invalid JWT token in WebSocket handshake: {}", e);
						}
					}
				}
			}
		}

		return false; // deny handshake
	}

	@Override
	public void afterHandshake(ServerHttpRequest request, org.springframework.http.server.ServerHttpResponse response,
			WebSocketHandler wsHandler, Exception exception) {
		// nothing to do
	}
}
