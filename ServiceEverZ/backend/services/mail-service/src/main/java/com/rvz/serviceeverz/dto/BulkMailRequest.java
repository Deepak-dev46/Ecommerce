package com.rvz.serviceeverz.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public class BulkMailRequest {

	@NotEmpty(message = "Recipients list must not be empty")
	private List<String> recipients;

	@NotBlank(message = "Subject must not be blank")
	private String subject;

	@NotBlank(message = "Body must not be blank")
	private String body;

	private Boolean htmlBody;

	public BulkMailRequest() {
	}

	public List<String> getRecipients() {
		return recipients;
	}

	public void setRecipients(List<String> v) {
		recipients = v;
	}

	public String getSubject() {
		return subject;
	}

	public void setSubject(String v) {
		subject = v;
	}

	public String getBody() {
		return body;
	}

	public void setBody(String v) {
		body = v;
	}

	public Boolean getHtmlBody() {
		return htmlBody;
	}

	public void setHtmlBody(Boolean v) {
		htmlBody = v;
	}

	public boolean isHtmlBody() {
		return Boolean.TRUE.equals(htmlBody);
	}
}
