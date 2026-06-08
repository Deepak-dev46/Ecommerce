package com.rvz.serviceeverz.entity;



import java.time.LocalDateTime;

import com.rvz.serviceeverz.enums.NotificationType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
 
@Entity
@Table(name = "asset_notification_logs")
public class AssetNotificationLog {
 
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Column(name = "mapping_id") private Long mappingId;
 
    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", length = 60)
    private NotificationType notificationType;
 
    @Column(name = "recipient_user_id") private Long recipientUserId;
    @Column(name = "recipient_email", length = 120) private String recipientEmail;
    @Column(length = 255) private String subject;
    @Column(columnDefinition = "LONGTEXT") private String body;
    @Column(name = "is_sent") private Boolean isSent = false;
    @Column(name = "error_message", columnDefinition = "TEXT") private String errorMessage;
    @Column(name = "sent_at", updatable = false) private LocalDateTime sentAt;
 
    @PrePersist public void prePersist() { sentAt = LocalDateTime.now(); }
 
    public Long getId() { return id; }
    public Long getMappingId() { return mappingId; } public void setMappingId(Long v) { mappingId = v; }
    public NotificationType getNotificationType() { return notificationType; } public void setNotificationType(NotificationType v) { notificationType = v; }
    public Long getRecipientUserId() { return recipientUserId; } public void setRecipientUserId(Long v) { recipientUserId = v; }
    public String getRecipientEmail() { return recipientEmail; } public void setRecipientEmail(String v) { recipientEmail = v; }
    public String getSubject() { return subject; } public void setSubject(String v) { subject = v; }
    public String getBody() { return body; } public void setBody(String v) { body = v; }
    public Boolean getIsSent() { return isSent; } public void setIsSent(Boolean v) { isSent = v; }
    public String getErrorMessage() { return errorMessage; } public void setErrorMessage(String v) { errorMessage = v; }
    public LocalDateTime getSentAt() { return sentAt; }
}