package com.lovelink.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ClientForwardController {

	// List all known React frontend routes explicitly here:
	@GetMapping(value = { "/", "/features", "/auth", "/profile-setup", "/browse", "/random", "/likes", "/chat",
			"/profile", "/matches", "/admin", // for /admin
			"/admin/users", "/admin/banned", "/admin/reports", "/banned", "/maintenance" })
	public String forwardKnownPaths() {
		return "forward:/index.html";
	}

}