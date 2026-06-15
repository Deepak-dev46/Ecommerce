package com.rvz.serviceeverz.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class MailRequest {

	@NotBlank(message = "To address must not be blank")
	@Email(message = "To must be a valid email address")
	private String to;

	@NotBlank(message = "Subject must not be blank")
	private String subject;

	@NotBlank(message = "Body must not be blank")
	private String body;

	private boolean htmlBody;

	public MailRequest() {
	}

	public MailRequest(String to, String subject, String body, boolean htmlBody) {
		this.to = to;
		this.subject = subject;
		this.body = body;
		this.htmlBody = htmlBody;
	}

	public String getTo() {
		return to;
	}

	public void setTo(String to) {
		this.to = to;
	}

	public String getSubject() {
		return subject;
	}

	public void setSubject(String subject) {
		this.subject = subject;
	}

	public String getBody() {
		return body;
	}

	public void setBody(String body) {
		this.body = body;
	}

	public boolean isHtmlBody() {
		return htmlBody;
	}

	public void setHtmlBody(boolean htmlBody) {
		this.htmlBody = htmlBody;
	}
}