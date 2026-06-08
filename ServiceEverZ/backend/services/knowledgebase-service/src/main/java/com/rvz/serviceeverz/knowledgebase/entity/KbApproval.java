package com.rvz.serviceeverz.knowledgebase.entity;
 
import com.rvz.serviceeverz.knowledgebase.enums.ApprovalStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;
 
@Entity
@Table(name = "kb_approval")
public class KbApproval {
 
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "article_version_id", nullable = false) private KbArticleVersion articleVersion;
    private Long approverId;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private ApprovalStatus status;
    @Column(length = 1000) private String comments;
    private LocalDateTime decidedAt;
    @Column(nullable = false, updatable = false) private LocalDateTime createdAt;
 
    @PrePersist public void prePersist() { createdAt = LocalDateTime.now(); }
 
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public KbArticleVersion getArticleVersion() { return articleVersion; }
    public void setArticleVersion(KbArticleVersion v) { this.articleVersion = v; }
    public Long getApproverId() { return approverId; } public void setApproverId(Long a) { this.approverId = a; }
    public ApprovalStatus getStatus() { return status; } public void setStatus(ApprovalStatus s) { this.status = s; }
    public String getComments() { return comments; } public void setComments(String c) { this.comments = c; }
    public LocalDateTime getDecidedAt() { return decidedAt; } public void setDecidedAt(LocalDateTime t) { this.decidedAt = t; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
}