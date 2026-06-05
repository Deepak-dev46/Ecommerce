package com.rvz.serviceeverz.dto.response;

import com.rvz.serviceeverz.enums.AttachmentSection;

import java.time.LocalDateTime;

public class ProblemAttachmentResponse {

    private Long id;
    private Long problemId;
    private String problemNumber;
    private AttachmentSection section;
    private String originalFileName;
    private String contentType;
    private Long fileSize;
    private Long uploadedBySpId;
    private String uploadedBySpName;
    private LocalDateTime uploadedAt;

    /** Download URL hint — controller fills this in */
    private String downloadUrl;

    // ── Getters & Setters ─────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProblemId() { return problemId; }
    public void setProblemId(Long problemId) { this.problemId = problemId; }

    public String getProblemNumber() { return problemNumber; }
    public void setProblemNumber(String problemNumber) { this.problemNumber = problemNumber; }

    public AttachmentSection getSection() { return section; }
    public void setSection(AttachmentSection section) { this.section = section; }

    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public Long getUploadedBySpId() { return uploadedBySpId; }
    public void setUploadedBySpId(Long uploadedBySpId) { this.uploadedBySpId = uploadedBySpId; }

    public String getUploadedBySpName() { return uploadedBySpName; }
    public void setUploadedBySpName(String uploadedBySpName) { this.uploadedBySpName = uploadedBySpName; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }

    public String getDownloadUrl() { return downloadUrl; }
    public void setDownloadUrl(String downloadUrl) { this.downloadUrl = downloadUrl; }
}
