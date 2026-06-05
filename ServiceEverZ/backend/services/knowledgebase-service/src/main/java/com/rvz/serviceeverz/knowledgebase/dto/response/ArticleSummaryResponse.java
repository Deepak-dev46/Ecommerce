package com.rvz.serviceeverz.knowledgebase.dto.response;
 
import com.rvz.serviceeverz.knowledgebase.enums.*;
import java.util.List;
 
public class ArticleSummaryResponse {
    private Long id; private String kbNumber; private String title; private String summary;
    private ArticleStatus status; private ArticleVisibility visibility; private ArticleCreationType creationType;
    private String categoryName; private List<String> tags;
    private Long currentVersionId; private Integer currentVersionNumber;
    private Double averageRating; private Long ratingCount;
    private String publishedAt; private String createdAt; private String updatedAt;
 
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getKbNumber() { return kbNumber; } public void setKbNumber(String k) { this.kbNumber = k; }
    public String getTitle() { return title; } public void setTitle(String t) { this.title = t; }
    public String getSummary() { return summary; } public void setSummary(String s) { this.summary = s; }
    public ArticleStatus getStatus() { return status; } public void setStatus(ArticleStatus s) { this.status = s; }
    public ArticleVisibility getVisibility() { return visibility; } public void setVisibility(ArticleVisibility v) { this.visibility = v; }
    public ArticleCreationType getCreationType() { return creationType; } public void setCreationType(ArticleCreationType c) { this.creationType = c; }
    public String getCategoryName() { return categoryName; } public void setCategoryName(String c) { this.categoryName = c; }
    public List<String> getTags() { return tags; } public void setTags(List<String> t) { this.tags = t; }
    public Long getCurrentVersionId() { return currentVersionId; } public void setCurrentVersionId(Long v) { this.currentVersionId = v; }
    public Integer getCurrentVersionNumber() { return currentVersionNumber; } public void setCurrentVersionNumber(Integer v) { this.currentVersionNumber = v; }
    public Double getAverageRating() { return averageRating; } public void setAverageRating(Double r) { this.averageRating = r; }
    public Long getRatingCount() { return ratingCount; } public void setRatingCount(Long r) { this.ratingCount = r; }
    public String getPublishedAt() { return publishedAt; } public void setPublishedAt(String t) { this.publishedAt = t; }
    public String getCreatedAt() { return createdAt; } public void setCreatedAt(String t) { this.createdAt = t; }
    public String getUpdatedAt() { return updatedAt; } public void setUpdatedAt(String t) { this.updatedAt = t; }
}
 