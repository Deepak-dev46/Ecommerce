package com.rvz.serviceeverz.knowledgebase.dto.response;

public class FeedbackResponse {
	private Long id;
	private Long articleId;
	private String kbNumber;
	private Long userId;
	private Integer rating;
	private String comment;
	private Boolean isAnonymous;
	private String createdAt;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getArticleId() {
		return articleId;
	}

	public void setArticleId(Long a) {
		this.articleId = a;
	}

	public String getKbNumber() {
		return kbNumber;
	}

	public void setKbNumber(String k) {
		this.kbNumber = k;
	}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long u) {
		this.userId = u;
	}

	public Integer getRating() {
		return rating;
	}

	public void setRating(Integer r) {
		this.rating = r;
	}

	public String getComment() {
		return comment;
	}

	public void setComment(String c) {
		this.comment = c;
	}

	public Boolean getIsAnonymous() {
		return isAnonymous;
	}

	public void setIsAnonymous(Boolean b) {
		this.isAnonymous = b;
	}

	public String getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(String t) {
		this.createdAt = t;
	}
}
