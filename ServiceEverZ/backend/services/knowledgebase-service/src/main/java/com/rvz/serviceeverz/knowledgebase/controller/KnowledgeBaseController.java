package com.rvz.serviceeverz.knowledgebase.controller;
 
import com.rvz.serviceeverz.knowledgebase.dto.request.*;
import com.rvz.serviceeverz.knowledgebase.dto.response.*;
import com.rvz.serviceeverz.knowledgebase.service.KnowledgeBaseService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
 
import java.nio.file.Paths;
import java.util.List;
 
@RestController
@RequestMapping("/api/kb")
@CrossOrigin(origins="http://localhost:5173")
public class KnowledgeBaseController {
 
    private final KnowledgeBaseService service;
 
    public KnowledgeBaseController(KnowledgeBaseService service) {
        this.service = service;
    }
 
    // ── Create Article ───────────────────────────────────────────────────────
    @PostMapping("/articles/form")
    public ResponseEntity<ApiResponse<ArticleDetailResponse>> createViaForm(
            @Valid @RequestBody CreateArticleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Article created as DRAFT", service.createArticleViaForm(request)));
    }
 
    // FIX (Bug 1): authorId changed to required=false on PDF and Video create endpoints.
    // Previously required=true (Spring default), which caused a 400 Bad Request whenever
    // authorId was null or not yet resolved from the auth context on the frontend.
    // The service layer already handles null authorId safely (defaults to 0L).
    @PostMapping("/articles/pdf")
    public ResponseEntity<ApiResponse<ArticleDetailResponse>> createViaPdf(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam(required = false) Long authorId,
            @RequestParam(required = false) Long categoryId,
            @RequestPart MultipartFile pdfFile) {
        return ResponseEntity.ok(ApiResponse.success("PDF article created as DRAFT",
                service.createArticleViaPdf(title, description, authorId, categoryId, pdfFile)));
    }
 
    @PostMapping("/articles/video")
    public ResponseEntity<ApiResponse<ArticleDetailResponse>> createViaVideo(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam(required = false) Long authorId,
            @RequestParam(required = false) Long categoryId,
            @RequestPart MultipartFile videoFile) {
        return ResponseEntity.ok(ApiResponse.success("Video article created as DRAFT",
                service.createArticleViaVideo(title, description, authorId, categoryId, videoFile)));
    }
 
    // ── Update Draft ─────────────────────────────────────────────────────────
    @PutMapping("/articles/{articleId}/versions/{versionId}/draft/form")
    public ResponseEntity<ApiResponse<ArticleDetailResponse>> updateDraftForm(
            @PathVariable Long articleId, @PathVariable Long versionId,
            @Valid @RequestBody CreateArticleRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.updateDraftVersion(articleId, versionId, request)));
    }
 
    @PutMapping("/articles/{articleId}/versions/{versionId}/draft/pdf")
    public ResponseEntity<ApiResponse<ArticleDetailResponse>> updateDraftPdf(
            @PathVariable Long articleId, @PathVariable Long versionId,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam(required = false) Long categoryId,
            @RequestPart MultipartFile pdfFile) {
        return ResponseEntity.ok(ApiResponse.success(
                service.updateDraftVersionPdf(articleId, versionId, title, description, categoryId, pdfFile)));
    }
 
    @PutMapping("/articles/{articleId}/versions/{versionId}/draft/video")
    public ResponseEntity<ApiResponse<ArticleDetailResponse>> updateDraftVideo(
            @PathVariable Long articleId, @PathVariable Long versionId,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam(required = false) Long categoryId,
            @RequestPart MultipartFile videoFile) {
        return ResponseEntity.ok(ApiResponse.success(
                service.updateDraftVersionVideo(articleId, versionId, title, description, categoryId, videoFile)));
    }
 
    // ── Submit for Approval ──────────────────────────────────────────────────
    @PostMapping("/articles/{articleId}/versions/{versionId}/submit")
    public ResponseEntity<ApiResponse<ArticleDetailResponse>> submit(
            @PathVariable Long articleId, @PathVariable Long versionId) {
        return ResponseEntity.ok(ApiResponse.success("Submitted for approval", service.submitForApproval(articleId, versionId)));
    }
 
    // ── Approval Decision ────────────────────────────────────────────────────
    @PutMapping("/versions/{versionId}/approve")
    public ResponseEntity<ApiResponse<ApprovalResponse>> decide(
            @PathVariable Long versionId, @Valid @RequestBody ApprovalDecisionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.decideApproval(versionId, request)));
    }
 
    @GetMapping("/versions/{versionId}/approvals")
    public ResponseEntity<ApiResponse<List<ApprovalResponse>>> getApprovals(@PathVariable Long versionId) {
        return ResponseEntity.ok(ApiResponse.success(service.getApprovalsByVersion(versionId)));
    }
 
    // ── New Version from PUBLISHED ───────────────────────────────────────────
    @PostMapping("/articles/{articleId}/versions/form")
    public ResponseEntity<ApiResponse<ArticleDetailResponse>> newVersionForm(
            @PathVariable Long articleId, @Valid @RequestBody CreateArticleRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "New version created and submitted for ITSM Manager approval",
                service.createNewVersionViaForm(articleId, request)));
    }
 
    @PostMapping("/articles/{articleId}/versions/pdf")
    public ResponseEntity<ApiResponse<ArticleDetailResponse>> newVersionPdf(
            @PathVariable Long articleId,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam(required = false) Long authorId,
            @RequestParam(required = false) Long categoryId,
            @RequestPart MultipartFile pdfFile) {
        return ResponseEntity.ok(ApiResponse.success(
                "New PDF version created and submitted for ITSM Manager approval",
                service.createNewVersionViaPdf(articleId, title, description, authorId, categoryId, pdfFile)));
    }
 
    @PostMapping("/articles/{articleId}/versions/video")
    public ResponseEntity<ApiResponse<ArticleDetailResponse>> newVersionVideo(
            @PathVariable Long articleId,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam(required = false) Long authorId,
            @RequestParam(required = false) Long categoryId,
            @RequestPart MultipartFile videoFile) {
        return ResponseEntity.ok(ApiResponse.success(
                "New Video version created and submitted for ITSM Manager approval",
                service.createNewVersionViaVideo(articleId, title, description, authorId, categoryId, videoFile)));
    }
    // ── Read ──────────────────────────────────────────────────────────────────
    @GetMapping("/articles")
    public ResponseEntity<ApiResponse<List<ArticleSummaryResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(service.getAllArticles()));
    }
 
    @GetMapping("/articles/{id}")
    public ResponseEntity<ApiResponse<ArticleDetailResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.getArticleById(id)));
    }
 
    @GetMapping("/articles/kb-number/{kbNumber}")
    public ResponseEntity<ApiResponse<ArticleDetailResponse>> getByKbNumber(@PathVariable String kbNumber) {
        return ResponseEntity.ok(ApiResponse.success(service.getArticleByKbNumber(kbNumber)));
    }
 
    @GetMapping("/articles/status/{status}")
    public ResponseEntity<ApiResponse<List<ArticleSummaryResponse>>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(ApiResponse.success(service.getArticlesByStatus(status)));
    }
 
    @GetMapping("/articles/author/{authorId}")
    public ResponseEntity<ApiResponse<List<ArticleSummaryResponse>>> getByAuthor(@PathVariable Long authorId) {
        return ResponseEntity.ok(ApiResponse.success(service.getArticlesByAuthor(authorId)));
    }
 
    @GetMapping("/articles/pending-approval")
    public ResponseEntity<ApiResponse<List<ArticleSummaryResponse>>> getPending() {
        return ResponseEntity.ok(ApiResponse.success(service.getArticlesPendingApproval()));
    }
 
    // ── Search Articles ───────────────────────────────────────────────────────
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ArticleSummaryResponse>>> search(
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(ApiResponse.success(service.searchArticles(keyword)));
    }
 
    // ── Version History ───────────────────────────────────────────────────────
    @GetMapping("/articles/{articleId}/versions")
    public ResponseEntity<ApiResponse<List<VersionHistoryResponse>>> getVersionHistory(
            @PathVariable Long articleId,
            @RequestParam(defaultValue = "END_USER") String role) {
        return ResponseEntity.ok(ApiResponse.success(service.getVersionHistory(articleId, role)));
    }
 
    @GetMapping("/versions/{versionId}")
    public ResponseEntity<ApiResponse<VersionHistoryResponse>> getVersion(@PathVariable Long versionId) {
        return ResponseEntity.ok(ApiResponse.success(service.getVersionById(versionId)));
    }
 
    // ── Feedback ──────────────────────────────────────────────────────────────
    @PostMapping("/articles/{articleId}/feedback")
    public ResponseEntity<ApiResponse<FeedbackResponse>> submitFeedback(
            @PathVariable Long articleId, @Valid @RequestBody FeedbackRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Feedback submitted", service.submitFeedback(articleId, request)));
    }
 
    @GetMapping("/articles/{articleId}/feedback")
    public ResponseEntity<ApiResponse<List<FeedbackResponse>>> getFeedback(@PathVariable Long articleId) {
        return ResponseEntity.ok(ApiResponse.success(service.getFeedbackByArticle(articleId)));
    }
    
    // ── Categories ────────────────────────────────────────────────────────────
    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CreateCategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Category created", service.createCategory(request)));
    }
 
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success(service.getAllCategories()));
    }
 
    @GetMapping("/categories/search")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> searchCategories(
            @RequestParam(required = false, defaultValue = "") String q) {
        return ResponseEntity.ok(ApiResponse.success(service.searchCategories(q)));
    }
 
    // ── File Download ─────────────────────────────────────────────────────────
    @GetMapping("/versions/{versionId}/download")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable Long versionId) {
        try {
            VersionHistoryResponse ver = service.getVersionById(versionId);
            if (ver.getAttachmentPath() == null || ver.getAttachmentPath().isBlank()) {
                return ResponseEntity.notFound().build();
            }
            java.nio.file.Path resolvedPath =
                    Paths.get("uploads/kb", ver.getAttachmentPath()).normalize();
            Resource resource = new UrlResource(resolvedPath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }
            String contentType = ver.getAttachmentMimeType() != null
                    ? ver.getAttachmentMimeType() : "application/octet-stream";
            String filename = ver.getAttachmentOriginalName() != null
                    ? ver.getAttachmentOriginalName() : "attachment";
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}