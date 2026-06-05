package com.rvz.emailticketservice.service;

import com.rvz.emailticketservice.dto.ParsedEmailData;
import com.rvz.emailticketservice.dto.response.EmailProcessingResponse;

import java.util.List;

public interface EmailTicketService {

    /**
     * Fully validates and processes a single parsed email:
     * 1. Validate requester email exists in master-data-service.
     * 2. Lookup user by EmployeeId and cross-validate name + email.
     * 3. Check all required fields are present; notify user if missing.
     * 4. Validate category, subcategory, item, priority, project against master-data;
     *    notify user on mismatch.
     * 5. Create and submit ticket via ticket-service.
     * 6. Send acknowledgement email with ticket details.
     *
     * @param emailData parsed email data
     * @return response with ticket number and acknowledgement status
     */
    EmailProcessingResponse processEmail(ParsedEmailData emailData);

    /**
     * Poll IMAP inbox and process all unread ticket emails.
     * @return list of results for each processed email
     */
    List<EmailProcessingResponse> pollAndProcess();
}
