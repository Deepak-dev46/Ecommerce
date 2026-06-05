package com.rvz.serviceeverz.entity;

import com.rvz.serviceeverz.enums.AttachmentSection;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "problem_attachments")
public class ProblemAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    /**
     * Which section this file belongs to:
     * SOLUTION | ROOT_CAUSE | WORKAROUND | PERMANENT_FIX
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttachmentSection section;

    /** Original file name as uploaded by the user */
    @Column(nullable = false)
    private String originalFileName;

    /** UUID-based file name stored on disk to avoid collisions */
    @Column(nullable = false)
    private String storedFileName;

    /** MIME type (e.g. image/png, application/pdf) */
    @Column(nullable = false)
    private String contentType;

    /** File size in bytes */
    private Long fileSize;

    /** ID of the SP who uploaded this file */
    private Long uploadedBySpId;

    @Column(updatable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    public void onCreate() {
        this.uploadedAt = LocalDateTime.now();
    }

    // ── Getters & Setters ─────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Problem getProblem() { return problem; }
    public void setProblem(Problem problem) { this.problem = problem; }

    public AttachmentSection getSection() { return section; }
    public void setSection(AttachmentSection section) { this.section = section; }

    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }

    public String getStoredFileName() { return storedFileName; }
    public void setStoredFileName(String storedFileName) { this.storedFileName = storedFileName; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public Long getUploadedBySpId() { return uploadedBySpId; }
    public void setUploadedBySpId(Long uploadedBySpId) { this.uploadedBySpId = uploadedBySpId; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
