package com.lovelink.security;

import java.io.IOException;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class RateLimitFilter extends HttpFilter {

	@Value("${lovelink.ratelimit.requests}")
	private long rateLimitRequests;

	// Caffeine cache with expiration and max size
	private final Cache<String, Bucket> cache = Caffeine.newBuilder().expireAfterAccess(Duration.ofMinutes(10))
			.maximumSize(10_000).build();

	private Bucket createNewBucket() {
		Bandwidth limit = Bandwidth.classic(rateLimitRequests, Refill.greedy(rateLimitRequests, Duration.ofMinutes(1)));
		return Bucket.builder().addLimit(limit).build();
	}

	@Override
	protected void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws IOException, ServletException {

		String ip = getClientIP(request);

		Bucket bucket = cache.get(ip, key -> createNewBucket());

		if (bucket.tryConsume(1)) {
			chain.doFilter(request, response);
		} else {
			response.setStatus(429);
			response.getWriter().write("Too many requests - Rate limit exceeded");
			response.getWriter().flush();
		}
	}

	private String getClientIP(HttpServletRequest request) {
		String xfHeader = request.getHeader("X-Forwarded-For");
		if (xfHeader == null) {
			return request.getRemoteAddr();
		}
		return xfHeader.split(",")[0];
	}
}
