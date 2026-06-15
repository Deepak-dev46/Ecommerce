package com.serviceeverz.emailservice.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
	private final JavaMailSender mailSender;

	public EmailService(JavaMailSender mailSender) {
		this.mailSender = mailSender;
	}

	public void sendOtp(String to, String otp) {
	    try {
	        MimeMessage msg = mailSender.createMimeMessage();
	        MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");

	        helper.setTo(to);
	        helper.setSubject("ServiceEverZ OTP Verification");

	        helper.setText(
	                "<h3>Your OTP</h3><p>OTP: <b>" + otp + "</b></p>" +
	                "<p>Expires in 5 minutes</p>",
	                true
	        );

	        mailSender.send(msg);
	    } catch (Exception e) {
	        throw new RuntimeException(e);
	    }
	}
	
	public void sendTempPassword(String to, String tempPw, String empId) {
		try {
			MimeMessage msg = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
			helper.setTo(to);
			helper.setSubject("ServiceEverZ - Temporary Password");
			helper.setText("<html><body><h3>Welcome to ServiceEverZ</h3><p>Employee ID: " + empId
					+ "</p><p>Temporary Password: <b>" + tempPw
					+ "</b></p><p>Please change it on first login.</p></body></html>", true);
			mailSender.send(msg);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
}