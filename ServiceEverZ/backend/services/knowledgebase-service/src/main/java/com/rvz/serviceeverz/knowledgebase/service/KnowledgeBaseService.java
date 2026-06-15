package com.rvz.serviceeverz.knowledgebase.service;

import com.rvz.serviceeverz.knowledgebase.dto.request.*;
import com.rvz.serviceeverz.knowledgebase.dto.response.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface KnowledgeBaseService {
	ArticleDetailResponse createArticleViaForm(CreateArticleRequest request);

	ArticleDetailResponse createArticleViaPdf(String title, String description, Long authorId, Long categoryId,
			MultipartFile pdfFile);

	ArticleDetailResponse createArticleViaVideo(String title, String description, Long authorId, Long categoryId,
			MultipartFile videoFile);

	ArticleDetailResponse updateDraftVersion(Long articleId, Long versionId, CreateArticleRequest request);

	ArticleDetailResponse updateDraftVersionPdf(Long articleId, Long versionId, String title, String description,
			Long categoryId, MultipartFile pdfFile);

	ArticleDetailResponse updateDraftVersionVideo(Long articleId, Long versionId, String title, String description,
			Long categoryId, MultipartFile videoFile);

	ArticleDetailResponse submitForApproval(Long articleId, Long versionId);

	ApprovalResponse decideApproval(Long versionId, ApprovalDecisionRequest request);

	List<ApprovalResponse> getApprovalsByVersion(Long versionId);

	ArticleDetailResponse createNewVersionViaForm(Long articleId, CreateArticleRequest request);

	ArticleDetailResponse createNewVersionViaPdf(Long articleId, String title, String description, Long authorId,
			Long categoryId, MultipartFile pdfFile);

	ArticleDetailResponse createNewVersionViaVideo(Long articleId, String title, String description, Long authorId,
			Long categoryId, MultipartFile videoFile);

	ArticleDetailResponse getArticleById(Long articleId);

	ArticleDetailResponse getArticleByKbNumber(String kbNumber);

	List<ArticleSummaryResponse> getAllArticles();

	List<ArticleSummaryResponse> getArticlesByStatus(String status);

	List<ArticleSummaryResponse> getArticlesByAuthor(Long authorId);

	List<ArticleSummaryResponse> getArticlesPendingApproval();

	List<ArticleSummaryResponse> searchArticles(String keyword);

	List<VersionHistoryResponse> getVersionHistory(Long articleId, String role);

	VersionHistoryResponse getVersionById(Long versionId);

	FeedbackResponse submitFeedback(Long articleId, FeedbackRequest request);

	List<FeedbackResponse> getFeedbackByArticle(Long articleId);

	CategoryResponse createCategory(CreateCategoryRequest request);

	List<CategoryResponse> getAllCategories();

	List<CategoryResponse> searchCategories(String query);
}
