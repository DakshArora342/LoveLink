package com.lovelink;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LoveLinkApplication {

	public static void main(String[] args) {
		SpringApplication.run(LoveLinkApplication.class, args);
	}

}