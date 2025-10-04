package com.lovelink.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.lovelink.extra.Constants;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AuthCookieUtil {

	@Value("${security.cookie.access-max-age}")
	private int accessCookieMaxAge;

	@Value("${security.cookie.refresh-max-age}")
	private int refreshCookieMaxAge;
	
	private final String cookieSameSiteAttribute = Constants.SAME_SITE_ATTRIBUTE;

	public void setAccessTokenCookie(HttpServletResponse response, String accessToken) {
		Cookie cookie = new Cookie("accessToken", accessToken);
		cookie.setHttpOnly(true);
		cookie.setSecure(true);
		cookie.setPath("/");
		cookie.setMaxAge(accessCookieMaxAge);
		cookie.setAttribute("SameSite", cookieSameSiteAttribute);
		response.addCookie(cookie);
	}

	public void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
		Cookie cookie = new Cookie("refreshToken", refreshToken);
		cookie.setHttpOnly(true);
		cookie.setSecure(true);
		cookie.setPath("/api/users");
		cookie.setMaxAge(refreshCookieMaxAge);
		cookie.setAttribute("SameSite", cookieSameSiteAttribute);
		response.addCookie(cookie);
	}

	public void clearAuthCookies(HttpServletResponse resp) {
		Cookie access = new Cookie("accessToken", null);
		access.setMaxAge(0);
		access.setHttpOnly(true);
		access.setSecure(true);
		access.setPath("/");
		access.setAttribute("SameSite", cookieSameSiteAttribute);

		Cookie refresh = new Cookie("refreshToken", null);
		refresh.setMaxAge(0);
		refresh.setHttpOnly(true);
		refresh.setSecure(true);
		refresh.setPath("/api/users");
		refresh.setAttribute("SameSite", cookieSameSiteAttribute);

		resp.addCookie(access);
		resp.addCookie(refresh);
	}
}
