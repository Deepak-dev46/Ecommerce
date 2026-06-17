package com.rvz.serviceeverz.knowledgebase.entity;
 
import jakarta.persistence.*;
import java.time.LocalDateTime;
 
@Entity
@Table(name = "kb_feedback")
public class KbFeedback {
 
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "article_id", nullable = false) private KbArticle article;
    private Long userId;
    @Column(nullable = false) private Integer rating;
    @Column(length = 1000) private String comment;
    @Column(nullable = false) private Boolean isAnonymous;
    @Column(nullable = false, updatable = false) private LocalDateTime createdAt;
 
    @PrePersist public void prePersist() {
        createdAt = LocalDateTime.now();
        if (isAnonymous == null) isAnonymous = false;
    }
 
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public KbArticle getArticle() { return article; } public void setArticle(KbArticle a) { this.article = a; }
    public Long getUserId() { return userId; } public void setUserId(Long u) { this.userId = u; }
    public Integer getRating() { return rating; } public void setRating(Integer r) { this.rating = r; }
    public String getComment() { return comment; } public void setComment(String c) { this.comment = c; }
    public Boolean getIsAnonymous() { return isAnonymous; } public void setIsAnonymous(Boolean b) { this.isAnonymous = b; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
}