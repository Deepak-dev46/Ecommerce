package com.rvz.serviceeverz.service;

import com.rvz.serviceeverz.dto.BulkMailRequest;
import com.rvz.serviceeverz.dto.MailRequest;

public interface MailService {
	String sendEmail(MailRequest request);

	String sendBulkEmail(BulkMailRequest request); // ← NEW
}
