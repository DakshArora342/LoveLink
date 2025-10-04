package com.lovelink.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

	private final JavaMailSender mailSender;

	@Value("${spring.mail.username}")
	private String fromEmail;

	public void sendOtpEmail(String toEmail, String otp) {
		try {
			MimeMessage message = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

			helper.setFrom(fromEmail);
			helper.setTo(toEmail);
			helper.setSubject("🔐 Verify Your LoveLink Account (OTP Inside)");

			String content = """
					<!-- Preheader (hidden in most clients) -->
					<div style="display:none;max-height:0;overflow:hidden;color:transparent;">
					  Your LoveLink OTP is %s. This code is valid for 5 minutes.
					</div>

					<div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;
					            background: #fff0f6; border: 1px solid #f8bbd0; border-radius: 16px;
					            padding: 32px; box-shadow: 0 6px 18px rgba(0,0,0,0.12);">

					  <!-- Brand -->
					  <div style="text-align:center; padding-bottom: 6px;">
					    <div style="font-size: 40px; line-height: 1; margin-bottom: 8px;">💘</div>
					    <h1 style="color:#e91e63; margin:0; font-size: 36px;">LoveLink</h1>
					    <p style="color:#666; margin:8px 0 0; font-size:16px;">Your Trusted Campus Connection</p>
					  </div>

					  <hr style="border:0; border-top:1px solid #f8bbd0; margin: 24px 0;" />

					  <!-- Title -->
					  <h2 style="color:#222; text-align:center; font-size: 28px; margin: 0 0 8px;">
					    Your One-Time Password
					  </h2>
					  <p style="text-align:center; font-size:18px; color:#444; margin: 0 0 20px;">
					    Use this code to verify your account:
					  </p>

					  <!-- BIG OTP BLOCK -->
					  <div style="text-align:center; margin: 24px 0 28px;">
					    <span style="display:inline-block; font-size: 44px; font-weight: 800;
					                 letter-spacing: 6px; color:#e91e63; padding: 18px 28px;
					                 background:#fde7ef; border: 2px dashed #f48fb1; border-radius: 12px;
					                 font-family: 'Courier New', Courier, monospace;">
					      %s
					    </span>
					  </div>

					  <!-- Time limit + safety -->
					  <p style="color:#555; font-size:16px; text-align:center; margin: 0 0 16px;">
					    ⚠️ This code is valid for <b>5 minutes</b>.
					  </p>
					  <p style="color:#777; font-size:14px; text-align:center; margin: 0 0 24px;">
					    For your security, <b>do not share</b> this code with anyone.
					  </p>

					  <hr style="border:0; border-top:1px solid #f8bbd0; margin: 24px 0;" />

					  <!-- Footer -->
					  <p style="color:#999; font-size:12px; text-align:center; margin: 0;">
					    You received this because a verification was requested for your email on LoveLink.<br/>
					    If this wasn’t you, you can safely ignore this email.
					  </p>
					</div>
					""".formatted(otp, otp);

			helper.setText(content, true);
			mailSender.send(message);

		} catch (MessagingException e) {
			throw new RuntimeException("Failed to send OTP email", e);
		}
	}
}