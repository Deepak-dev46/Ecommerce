package com.rvz.serviceeverz.knowledgebase.dto.request;
 
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
 
public class FeedbackRequest {
    private Long userId;
    @NotNull @Min(1) @Max(5) private Integer rating;
    private String comment;
    private Boolean isAnonymous;
 
    public Long getUserId() { return userId; } public void setUserId(Long u) { this.userId = u; }
    public Integer getRating() { return rating; } public void setRating(Integer r) { this.rating = r; }
    public String getComment() { return comment; } public void setComment(String c) { this.comment = c; }
    public Boolean getIsAnonymous() { return isAnonymous; } public void setIsAnonymous(Boolean b) { this.isAnonymous = b; }
}
 