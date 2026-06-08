package com.rvz.emailticketservice.parser;

import com.rvz.emailticketservice.dto.ParsedEmail;
import jakarta.mail.Message;
import jakarta.mail.Multipart;
import jakarta.mail.Part;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.StringReader;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;

/**
 * Parses a raw Jakarta Mail Message into ParsedEmail.
 *
 * SUBJECT FORMAT:  Category|SubCategory|FullName
 *
 * BODY FORMAT (each line):
 *   EmployeeId       : 1001
 *   Project          : ServiceEverZ
 *   Item             : Laptop Replacement
 *   Priority         : HIGH
 *   Location         : Chennai - Block A, Floor 2
 *   MobileNumber     : 9876543210
 *   Asset            : LPT-00234          (optional)
 *   AccessRequiredTill: 2026-06-30        (optional)
 *   Description      : Multiline text...
 */
@Component
public class EmailParser {

    private static final Logger log = LoggerFactory.getLogger(EmailParser.class);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final List<String> ALLOWED_EXTENSIONS =
            Arrays.asList(".jpg", ".jpeg", ".png", ".pdf", ".docx", ".xlsx");

    public ParsedEmail parse(Message message) throws Exception {
        ParsedEmail result = new ParsedEmail();

        // Message-ID for deduplication
        String[] ids = message.getHeader("Message-ID");
        result.setMessageId(ids != null && ids.length > 0 ? ids[0] : null);

        // From address
        String from = message.getFrom() != null && message.getFrom().length > 0
                ? message.getFrom()[0].toString() : null;
        // strip "Name <email>" → just email
        if (from != null && from.contains("<")) {
            from = from.substring(from.indexOf('<') + 1, from.lastIndexOf('>'));
        }
        result.setFromAddress(from);

        // Subject → Category|SubCategory|FullName
        String subject = message.getSubject();
        result.setRawSubject(subject);
        parseSubject(subject, result);

        // Body text
        String bodyText = extractText(message);
        parseBody(bodyText, result);

        // Attachments
        extractAttachments(message, result);

        log.info("Parsed email: from={}, subject={}, category={}, subCategory={}, name={}",
                result.getFromAddress(), subject,
                result.getCategory(), result.getSubCategory(), result.getRequesterName());
        return result;
    }

    // ── Subject: Category|SubCategory|FullName ────────────────────────────────
    private void parseSubject(String subject, ParsedEmail result) {
        if (subject == null || subject.isBlank()) return;
        String[] parts = subject.split("\\|", 3);
        if (parts.length >= 1) result.setCategory(parts[0].trim());
        if (parts.length >= 2) result.setSubCategory(parts[1].trim());
        if (parts.length >= 3) result.setRequesterName(parts[2].trim());
    }

    // ── Body: key : value lines + Description (multiline) ────────────────────
    private void parseBody(String body, ParsedEmail result) {
        if (body == null || body.isBlank()) return;
        StringBuilder descBuf = new StringBuilder();
        boolean inDescription = false;

        try (BufferedReader br = new BufferedReader(new StringReader(body))) {
            String line;
            while ((line = br.readLine()) != null) {
                String trimmed = line.trim();

                // Once we see "Description:", everything after is description
                if (trimmed.toLowerCase().startsWith("description")) {
                    inDescription = true;
                    String afterColon = afterColon(trimmed);
                    if (!afterColon.isBlank()) descBuf.append(afterColon).append("\n");
                    continue;
                }

                if (inDescription) {
                    descBuf.append(line).append("\n");
                    continue;
                }

                if (trimmed.isEmpty()) continue;

                String key   = key(trimmed).toLowerCase().replace(" ", "").replace("_", "");
                String value = afterColon(trimmed);

                switch (key) {
                    case "employeeid"        -> result.setEmployeeId(value);
                    case "project"           -> result.setProject(value);
                    case "item"              -> result.setItem(value);
                    case "priority"          -> result.setPriority(value.toUpperCase());
                    case "location"          -> result.setLocation(value);
                    case "mobilenumber",
                         "mobile"           -> result.setMobileNumber(value.replaceAll("\\s+", ""));              
                    case "accessrequiredtill",
                         "accesstill",
                         "accessdate"       -> {
                        try { result.setAccessRequiredTill(LocalDate.parse(value.trim(), DATE_FMT)); }
                        catch (Exception e) { log.warn("Could not parse AccessRequiredTill: {}", value); }
                    }
                    default -> { /* ignore unknown keys */ }
                }
            }
        } catch (Exception e) {
            log.warn("Body parse error: {}", e.getMessage());
        }

        String desc = descBuf.toString().trim();
        if (!desc.isBlank()) result.setDescription(desc);
    }

    private String key(String line) {
        int colon = line.indexOf(':');
        return colon > 0 ? line.substring(0, colon).trim() : line.trim();
    }

    private String afterColon(String line) {
        int colon = line.indexOf(':');
        return colon >= 0 && colon + 1 < line.length()
                ? line.substring(colon + 1).trim() : "";
    }

    // ── Text extraction ───────────────────────────────────────────────────────
    private String extractText(Part part) throws Exception {
        if (part.isMimeType("text/plain")) {
            return (String) part.getContent();
        }
        if (part.isMimeType("text/html")) {
            String html = (String) part.getContent();
            return html.replaceAll("<br\\s*/?>", "\n")
                       .replaceAll("<p\\s*/?>", "\n")
                       .replaceAll("<[^>]+>", "")
                       .replaceAll("&nbsp;", " ")
                       .replaceAll("&amp;",  "&");
        }
        if (part.isMimeType("multipart/*")) {
            Multipart mp = (Multipart) part.getContent();
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < mp.getCount(); i++) {
                String t = extractText(mp.getBodyPart(i));
                if (t != null) sb.append(t).append("\n");
            }
            return sb.toString();
        }
        return null;
    }

    // ── Attachment extraction ─────────────────────────────────────────────────
    private void extractAttachments(Part part, ParsedEmail result) throws Exception {
        if (part.isMimeType("multipart/*")) {
            Multipart mp = (Multipart) part.getContent();
            for (int i = 0; i < mp.getCount(); i++) {
                extractAttachments(mp.getBodyPart(i), result);
            }
        } else {
            String disposition = part.getDisposition();
            String filename    = part.getFileName();
            if (filename != null && (Part.ATTACHMENT.equalsIgnoreCase(disposition)
                    || Part.INLINE.equalsIgnoreCase(disposition))) {
                String lower = filename.toLowerCase();
                boolean valid = ALLOWED_EXTENSIONS.stream().anyMatch(lower::endsWith);
                if (valid) {
                    long size = part.getSize();
                    if (size < 0) size = 0;
                    result.getAttachments().add(new ParsedEmail.Attachment(filename, size));
                } else {
                    log.debug("Skipping unsupported attachment: {}", filename);
                }
            }
        }
    }
}