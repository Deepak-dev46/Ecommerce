package com.rvz.serviceeverz.knowledgebase.serviceimpl;

import com.rvz.serviceeverz.knowledgebase.dto.request.*;
import com.rvz.serviceeverz.knowledgebase.dto.response.*;
import com.rvz.serviceeverz.knowledgebase.entity.*;
import com.rvz.serviceeverz.knowledgebase.enums.*;
import com.rvz.serviceeverz.knowledgebase.exception.*;
import com.rvz.serviceeverz.knowledgebase.repository.*;
import com.rvz.serviceeverz.knowledgebase.service.FileStorageService;
import com.rvz.serviceeverz.knowledgebase.service.KnowledgeBaseService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class KnowledgeBaseServiceImpl implements KnowledgeBaseService {

	private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

	private final KbArticleRepository articleRepo;
	private final KbArticleVersionRepository versionRepo;
	private final KbApprovalRepository approvalRepo;
	private final KbFeedbackRepository feedbackRepo;
	private final KbCategoryRepository categoryRepo;
	private final KbTagRepository tagRepo;
	private final FileStorageService fileStorageService;

	public KnowledgeBaseServiceImpl(KbArticleRepository articleRepo, KbArticleVersionRepository versionRepo,
			KbApprovalRepository approvalRepo, KbFeedbackRepository feedbackRepo, KbCategoryRepository categoryRepo,
			KbTagRepository tagRepo, FileStorageService fileStorageService) {
		this.articleRepo = articleRepo;
		this.versionRepo = versionRepo;
		this.approvalRepo = approvalRepo;
		this.feedbackRepo = feedbackRepo;
		this.categoryRepo = categoryRepo;
		this.tagRepo = tagRepo;
		this.fileStorageService = fileStorageService;
	}

	// ── Create ───────────────────────────────────────────────────────────────
	@Override
	@Transactional
	public ArticleDetailResponse createArticleViaForm(CreateArticleRequest req) {
	    KbArticle article = buildArticle(req.getTitle(), req.getAuthorId(), ArticleVisibility.EXTERNAL,
	            ArticleCreationType.FORM, req.getCategoryId(), null);
		KbArticle saved = articleRepo.save(article);
		KbArticleVersion ver = buildFormVersion(saved, req, 1);
		KbArticleVersion savedVer = versionRepo.save(ver);
		saved.setCurrentVersionId(savedVer.getId());
		articleRepo.save(saved);
		return toDetail(saved, savedVer);
	}

	@Override
	@Transactional
	public ArticleDetailResponse createArticleViaPdf(String title, String description, Long authorId, Long categoryId,
			MultipartFile pdfFile) {
		String path = fileStorageService.storePdf(pdfFile);
		KbArticle article = buildArticle(title, authorId, ArticleVisibility.EXTERNAL, ArticleCreationType.PDF,
				categoryId, null);
		KbArticle saved = articleRepo.save(article);
		KbArticleVersion ver = buildFileVersion(saved, title, description, authorId, path,
				pdfFile.getOriginalFilename(), pdfFile.getContentType(), pdfFile.getSize(), ArticleCreationType.PDF, 1);
		KbArticleVersion savedVer = versionRepo.save(ver);
		saved.setCurrentVersionId(savedVer.getId());
		articleRepo.save(saved);
		return toDetail(saved, savedVer);
	}

	@Override
	@Transactional
	public ArticleDetailResponse createArticleViaVideo(String title, String description, Long authorId, Long categoryId,
			MultipartFile videoFile) {
		String path = fileStorageService.storeVideo(videoFile);
		KbArticle article = buildArticle(title, authorId, ArticleVisibility.EXTERNAL, ArticleCreationType.VIDEO,
				categoryId, null);
		KbArticle saved = articleRepo.save(article);
		KbArticleVersion ver = buildFileVersion(saved, title, description, authorId, path,
				videoFile.getOriginalFilename(), videoFile.getContentType(), videoFile.getSize(),
				ArticleCreationType.VIDEO, 1);
		KbArticleVersion savedVer = versionRepo.save(ver);
		saved.setCurrentVersionId(savedVer.getId());
		articleRepo.save(saved);
		return toDetail(saved, savedVer);
	}

	// ── Update Draft ─────────────────────────────────────────────────────────

	@Override
	@Transactional
	public ArticleDetailResponse updateDraftVersion(Long articleId, Long versionId, CreateArticleRequest req) {
		KbArticle article = findArticleOrThrow(articleId);
		KbArticleVersion ver = findVersionOrThrow(versionId);
		assertBelongs(ver, articleId);
		assertDraft(ver);
		ver.setTitle(req.getTitle());
		ver.setSummary(req.getSummary());
		ver.setChangeSummary(req.getChangeSummary());
		versionRepo.save(ver);
		article.setTitle(req.getTitle());
		applyCategory(article, req.getCategoryId());
		articleRepo.save(article);
		return toDetail(article, ver);
	}

	@Override
	@Transactional
	public ArticleDetailResponse updateDraftVersionPdf(Long articleId, Long versionId, String title, String description,
			Long categoryId, MultipartFile pdfFile) {
		KbArticle article = findArticleOrThrow(articleId);
		KbArticleVersion ver = findVersionOrThrow(versionId);
		assertBelongs(ver, articleId);
		assertDraft(ver);
		String path = fileStorageService.storePdf(pdfFile);
		ver.setTitle(title);
		ver.setSummary(description);
		ver.setAttachmentPath(path);
		ver.setAttachmentOriginalName(pdfFile.getOriginalFilename());
		ver.setAttachmentMimeType(pdfFile.getContentType());
		ver.setAttachmentSizeBytes(pdfFile.getSize());
		versionRepo.save(ver);
		article.setTitle(title);
		applyCategory(article, categoryId);
		articleRepo.save(article);
		return toDetail(article, ver);
	}

	@Override
	@Transactional
	public ArticleDetailResponse updateDraftVersionVideo(Long articleId, Long versionId, String title,
			String description, Long categoryId, MultipartFile videoFile) {
		KbArticle article = findArticleOrThrow(articleId);
		KbArticleVersion ver = findVersionOrThrow(versionId);
		assertBelongs(ver, articleId);
		assertDraft(ver);
		String path = fileStorageService.storeVideo(videoFile);
		ver.setTitle(title);
		ver.setSummary(description);
		ver.setAttachmentPath(path);
		ver.setAttachmentOriginalName(videoFile.getOriginalFilename());
		ver.setAttachmentMimeType(videoFile.getContentType());
		ver.setAttachmentSizeBytes(videoFile.getSize());
		versionRepo.save(ver);
		article.setTitle(title);
		applyCategory(article, categoryId);
		articleRepo.save(article);
		return toDetail(article, ver);
	}

	// ── Approval ─────────────────────────────────────────────────────────────

	@Override
	@Transactional
	public ArticleDetailResponse submitForApproval(Long articleId, Long versionId) {
		KbArticle article = findArticleOrThrow(articleId);
		KbArticleVersion ver = findVersionOrThrow(versionId);
		assertBelongs(ver, articleId);
		// Accept both DRAFT and SENT_BACK versions for submission
		if (ver.getState() != VersionStatus.DRAFT && ver.getState() != VersionStatus.SENT_BACK)
			throw new BadRequestException("Only DRAFT or SENT_BACK versions can be submitted. State: " + ver.getState());
		if (versionRepo.existsByArticleIdAndState(articleId, VersionStatus.IN_REVIEW))
			throw new BadRequestException("A version is already under review for this article.");
		ver.setState(VersionStatus.IN_REVIEW);
		ver.setSubmittedForApprovalAt(LocalDateTime.now());
		versionRepo.save(ver);
		KbApproval approval = new KbApproval();
		approval.setArticleVersion(ver);
		approval.setStatus(ApprovalStatus.PENDING);
		approvalRepo.save(approval);
		article.setStatus(ArticleStatus.UNDER_REVIEW);
		articleRepo.save(article);
		return toDetail(article, ver);
	}

	@Override
	@Transactional
	public ApprovalResponse decideApproval(Long versionId, ApprovalDecisionRequest req) {
		KbArticleVersion ver = findVersionOrThrow(versionId);
		if (ver.getState() != VersionStatus.IN_REVIEW)
			throw new BadRequestException("Version not IN_REVIEW. State: " + ver.getState());
		KbApproval approval = approvalRepo.findByArticleVersionIdAndStatus(versionId, ApprovalStatus.PENDING)
				.orElse(new KbApproval());
		approval.setArticleVersion(ver);
		approval.setApproverId(req.getApproverId());
		approval.setComments(req.getComments());
		approval.setDecidedAt(LocalDateTime.now());
		KbArticle article = ver.getArticle();
		switch (req.getStatus()) {
		case APPROVED -> {
			approval.setStatus(ApprovalStatus.APPROVED);
			// Archive any previously active version
			versionRepo.findByArticleIdAndIsActiveVersionTrue(article.getId()).ifPresent(prev -> {
				if (!prev.getId().equals(ver.getId())) {
					prev.setIsActiveVersion(false);
					prev.setState(VersionStatus.ARCHIVED);
					versionRepo.save(prev);
				}
			});
			ver.setState(VersionStatus.PUBLISHED);
			ver.setApprovedAt(LocalDateTime.now());
			ver.setApprovedBy(req.getApproverId());
			ver.setPublishedAt(LocalDateTime.now());
			ver.setIsActiveVersion(true);
			// Article goes back to PUBLISHED — the new approved version is now live
			article.setStatus(ArticleStatus.PUBLISHED);
			article.setCurrentVersionId(ver.getId());
			article.setTitle(ver.getTitle());
		}
		case REJECTED -> {
			approval.setStatus(ApprovalStatus.REJECTED);
			ver.setState(VersionStatus.REJECTED);
			ver.setRejectedAt(LocalDateTime.now());
			ver.setRejectedBy(req.getApproverId());
			ver.setRejectionReason(req.getComments());
			// If there is an existing active (published) version, restore to PUBLISHED.
			// If this was the first version ever submitted (no active version exists),
			// the article was never published — set it to REJECTED so it cannot be submitted again.
			boolean hasActiveVersion = versionRepo.findByArticleIdAndIsActiveVersionTrue(article.getId()).isPresent();
			article.setStatus(hasActiveVersion ? ArticleStatus.PUBLISHED : ArticleStatus.REJECTED);
		}
		case SENT_BACK -> {
			approval.setStatus(ApprovalStatus.SENT_BACK);
			ver.setState(VersionStatus.SENT_BACK);
			ver.setSentBackAt(LocalDateTime.now());
			ver.setSentBackBy(req.getApproverId());
			ver.setSentBackReason(req.getComments());
			// If there is an existing active (published) version, restore to PUBLISHED.
			// If this was the first version (no active version), restore to DRAFT so it can be edited & resubmitted.
			boolean hasActiveVersionSB = versionRepo.findByArticleIdAndIsActiveVersionTrue(article.getId()).isPresent();
			article.setStatus(hasActiveVersionSB ? ArticleStatus.PUBLISHED : ArticleStatus.DRAFT);
		}
		default -> throw new BadRequestException("Invalid decision: " + req.getStatus());
		}
		versionRepo.save(ver);
		articleRepo.save(article);
		return toApproval(approvalRepo.save(approval));
	}

	@Override
	@Transactional(readOnly = true)
	public List<ApprovalResponse> getApprovalsByVersion(Long versionId) {
		return approvalRepo.findByArticleVersionId(versionId).stream().map(this::toApproval)
				.collect(Collectors.toList());
	}

	// ── New Version from PUBLISHED ────────────────────────────────────────────
	// When support personnel uploads a new version of a published article,
	// it is automatically submitted for ITSM Manager approval (IN_REVIEW).
	// The article status changes to UNDER_REVIEW while the old published version
	// remains the active (visible) version for end users until approval.

	@Override
	@Transactional
	public ArticleDetailResponse createNewVersionViaForm(Long articleId, CreateArticleRequest req) {
		KbArticle article = findArticleOrThrow(articleId);
		assertPublished(article);
		assertNoInReview(articleId);
		KbArticleVersion ver = buildFormVersion(article, req, nextVer(articleId));
		KbArticleVersion saved = versionRepo.save(ver);
		// FIX (Bug 6): Apply category from the new-version request to the article.
		// Previously the category was never updated when creating a new version via form,
		// so selecting a different category in the form had no effect.
		if (req.getCategoryId() != null) applyCategory(article, req.getCategoryId());
		submitNewVersionForApproval(article, saved);
		return toDetail(article, saved);
	}

	@Override
	@Transactional
	public ArticleDetailResponse createNewVersionViaPdf(Long articleId, String title, String description, Long authorId,
			Long categoryId, MultipartFile pdfFile) {
		KbArticle article = findArticleOrThrow(articleId);
		assertPublished(article);
		assertNoInReview(articleId);
		String path = fileStorageService.storePdf(pdfFile);
		KbArticleVersion ver = buildFileVersion(article, title, description, authorId, path,
				pdfFile.getOriginalFilename(), pdfFile.getContentType(), pdfFile.getSize(),
				ArticleCreationType.PDF, nextVer(articleId));
		KbArticleVersion saved = versionRepo.save(ver);
		// FIX (Bug 7): Apply categoryId to article when creating new version via PDF.
		if (categoryId != null) applyCategory(article, categoryId);
		submitNewVersionForApproval(article, saved);
		return toDetail(article, saved);
	}

	@Override
	@Transactional
	public ArticleDetailResponse createNewVersionViaVideo(Long articleId, String title, String description,
			Long authorId, Long categoryId, MultipartFile videoFile) {
		KbArticle article = findArticleOrThrow(articleId);
		assertPublished(article);
		assertNoInReview(articleId);
		String path = fileStorageService.storeVideo(videoFile);
		KbArticleVersion ver = buildFileVersion(article, title, description, authorId, path,
				videoFile.getOriginalFilename(), videoFile.getContentType(), videoFile.getSize(),
				ArticleCreationType.VIDEO, nextVer(articleId));
		KbArticleVersion saved = versionRepo.save(ver);
		// FIX (Bug 7): Apply categoryId to article when creating new version via Video.
		if (categoryId != null) applyCategory(article, categoryId);
		submitNewVersionForApproval(article, saved);
		return toDetail(article, saved);
	}

	/**
	 * Shared helper: sets the newly created version to IN_REVIEW, creates a
	 * pending KbApproval record, and marks the article UNDER_REVIEW.
	 * The previously active (published) version remains isActiveVersion=true
	 * so end users continue to see the approved content until the new version
	 * is approved by the ITSM Manager.
	 */
	private void submitNewVersionForApproval(KbArticle article, KbArticleVersion ver) {
		ver.setState(VersionStatus.IN_REVIEW);
		ver.setSubmittedForApprovalAt(LocalDateTime.now());
		versionRepo.save(ver);

		KbApproval approval = new KbApproval();
		approval.setArticleVersion(ver);
		approval.setStatus(ApprovalStatus.PENDING);
		approvalRepo.save(approval);

		article.setStatus(ArticleStatus.UNDER_REVIEW);
		articleRepo.save(article);
	}

	// ── Read ──────────────────────────────────────────────────────────────────

	@Override
	@Transactional(readOnly = true)
	public ArticleDetailResponse getArticleById(Long articleId) {
		KbArticle a = findArticleOrThrow(articleId);
		KbArticleVersion v = versionRepo.findByArticleIdAndIsActiveVersionTrue(articleId)
				.orElseGet(() -> versionRepo.findByArticleIdOrderByVersionNumberDesc(articleId).stream().findFirst()
						.orElseThrow(() -> new ResourceNotFoundException("No version found for: " + articleId)));
		return toDetail(a, v);
	}

	@Override
	@Transactional(readOnly = true)
	public ArticleDetailResponse getArticleByKbNumber(String kbNumber) {
		KbArticle a = articleRepo.findByKbNumberAndIsDeletedFalse(kbNumber)
				.orElseThrow(() -> new ResourceNotFoundException("Article not found: " + kbNumber));
		KbArticleVersion v = versionRepo.findByArticleIdAndIsActiveVersionTrue(a.getId())
				.orElseGet(() -> versionRepo.findByArticleIdOrderByVersionNumberDesc(a.getId()).stream().findFirst()
						.orElseThrow(() -> new ResourceNotFoundException("No version found: " + kbNumber)));
		return toDetail(a, v);
	}

	@Override
	@Transactional(readOnly = true)
	public List<ArticleSummaryResponse> getAllArticles() {
		return articleRepo.findByIsDeletedFalse().stream().map(this::toSummary).collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public List<ArticleSummaryResponse> getArticlesByStatus(String status) {
		ArticleStatus s;
		try {
			s = ArticleStatus.valueOf(status.toUpperCase());
		} catch (IllegalArgumentException e) {
			throw new BadRequestException("Invalid status: " + status);
		}
		return articleRepo.findByStatusAndIsDeletedFalse(s).stream().map(this::toSummary).collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public List<ArticleSummaryResponse> getArticlesByAuthor(Long authorId) {
		return articleRepo.findByCreatedByAndIsDeletedFalse(authorId).stream().map(this::toSummary)
				.collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public List<ArticleSummaryResponse> getArticlesPendingApproval() {
		return articleRepo.findByStatusAndIsDeletedFalse(ArticleStatus.UNDER_REVIEW).stream().map(this::toSummary)
				.collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public List<ArticleSummaryResponse> searchArticles(String keyword) {
		if (keyword == null || keyword.isBlank())
			return articleRepo.findByStatusAndIsDeletedFalse(ArticleStatus.PUBLISHED).stream().map(this::toSummary)
					.collect(Collectors.toList());
		Set<KbArticle> results = new LinkedHashSet<>();
		results.addAll(articleRepo.searchPublishedByTitle(keyword));
		results.addAll(articleRepo.searchPublishedByTag(keyword));
		return results.stream().map(this::toSummary).collect(Collectors.toList());
	}

	/**
	 * Returns version history filtered by role:
	 *
	 * END_USER          → only PUBLISHED and ARCHIVED versions (approved content only)
	 * SUPPORT_PERSONNEL → all versions (DRAFT, IN_REVIEW, SENT_BACK, PUBLISHED, REJECTED, ARCHIVED)
	 * ITSM_MANAGER      → all versions (same as SUPPORT_PERSONNEL)
	 */
	@Override
	@Transactional(readOnly = true)
	public List<VersionHistoryResponse> getVersionHistory(Long articleId, String role) {
		findArticleOrThrow(articleId);
		boolean isEndUser = (role == null || role.equalsIgnoreCase("END_USER"));
		return versionRepo.findByArticleIdOrderByVersionNumberDesc(articleId).stream()
				.filter(v -> !isEndUser || v.getState() == VersionStatus.PUBLISHED || v.getState() == VersionStatus.ARCHIVED)
				.map(this::toVersionHistoryResponse)
				.collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public VersionHistoryResponse getVersionById(Long versionId) {
		return toVersionHistoryResponse(findVersionOrThrow(versionId));
	}

	// ── Feedback ──────────────────────────────────────────────────────────────

	@Override
	@Transactional
	public FeedbackResponse submitFeedback(Long articleId, FeedbackRequest req) {
		KbArticle article = findArticleOrThrow(articleId);
		if (article.getStatus() != ArticleStatus.PUBLISHED)
			throw new BadRequestException("Feedback only allowed on PUBLISHED articles.");
		if (req.getUserId() != null && !Boolean.TRUE.equals(req.getIsAnonymous()))
			if (feedbackRepo.existsByArticleIdAndUserId(articleId, req.getUserId()))
				throw new BadRequestException("User already submitted feedback for this article.");
		KbFeedback fb = new KbFeedback();
		fb.setArticle(article);
		fb.setUserId(Boolean.TRUE.equals(req.getIsAnonymous()) ? null : req.getUserId());
		fb.setRating(req.getRating());
		fb.setComment(req.getComment());
		fb.setIsAnonymous(req.getIsAnonymous() != null ? req.getIsAnonymous() : false);
		return toFeedback(feedbackRepo.save(fb));
	}

	@Override
	@Transactional(readOnly = true)
	public List<FeedbackResponse> getFeedbackByArticle(Long articleId) {
		findArticleOrThrow(articleId);
		return feedbackRepo.findByArticleId(articleId).stream().map(this::toFeedback).collect(Collectors.toList());
	}

	// ── Categories ────────────────────────────────────────────────────────────

	@Override
	@Transactional
	public CategoryResponse createCategory(CreateCategoryRequest req) {
		KbCategory cat = new KbCategory();
		cat.setName(req.getName());
		cat.setDescription(req.getDescription());
		cat.setParentId(req.getParentId());
		cat.setIsActive(true);
		return toCategory(categoryRepo.save(cat));
	}

	@Override
	@Transactional(readOnly = true)
	public List<CategoryResponse> getAllCategories() {
		return categoryRepo.findByIsActiveTrue().stream().map(this::toCategory).collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public List<CategoryResponse> searchCategories(String query) {
		if (query == null || query.isBlank()) {
			return categoryRepo.findByIsActiveTrue().stream().map(this::toCategory).collect(Collectors.toList());
		}
		return categoryRepo.findByNameContainingIgnoreCaseAndIsActiveTrue(query.trim())
				.stream().map(this::toCategory).collect(Collectors.toList());
	}

	// ── Private Helpers ───────────────────────────────────────────────────────

	private KbArticle findArticleOrThrow(Long id) {
		return articleRepo.findById(id).filter(a -> !a.getIsDeleted())
				.orElseThrow(() -> new ResourceNotFoundException("Article not found: " + id));
	}

	private KbArticleVersion findVersionOrThrow(Long id) {
		return versionRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Version not found: " + id));
	}

	private void assertBelongs(KbArticleVersion v, Long articleId) {
		if (!v.getArticle().getId().equals(articleId))
			throw new BadRequestException("Version does not belong to article: " + articleId);
	}

	// assertDraft also allows SENT_BACK state — SENT_BACK versions are editable and resubmittable
	private void assertDraft(KbArticleVersion v) {
		if (v.getState() != VersionStatus.DRAFT && v.getState() != VersionStatus.SENT_BACK)
			throw new BadRequestException("Only DRAFT or SENT_BACK versions can be edited. State: " + v.getState());
	}

	private void assertPublished(KbArticle article) {
		if (article.getStatus() != ArticleStatus.PUBLISHED)
			throw new BadRequestException("New versions only from PUBLISHED articles. Current: " + article.getStatus());
	}

	private void assertNoInReview(Long articleId) {
		if (versionRepo.existsByArticleIdAndState(articleId, VersionStatus.IN_REVIEW))
			throw new BadRequestException("A version is already under review for this article.");
	}

	private int nextVer(Long articleId) {
		Integer max = versionRepo.findMaxVersionNumberByArticleId(articleId);
		return (max == null ? 0 : max) + 1;
	}

	private Set<KbTag> resolveTags(List<String> names) {
		Set<KbTag> tags = new HashSet<>();
		if (names == null) return tags;
		for (String name : names) {
			String t = name.trim();
			KbTag tag = tagRepo.findByNameIgnoreCase(t).orElseGet(() -> {
				KbTag n = new KbTag();
				n.setName(t);
				return tagRepo.save(n);
			});
			tags.add(tag);
		}
		return tags;
	}

	private void applyCategory(KbArticle a, Long catId) {
		if (catId != null)
			a.setCategory(categoryRepo.findById(catId)
					.orElseThrow(() -> new ResourceNotFoundException("Category not found: " + catId)));
	}

	private void applyTags(KbArticle a, List<String> names) {
		if (names != null && !names.isEmpty())
			a.setTags(resolveTags(names));
	}

	private KbArticle buildArticle(String title, Long authorId, ArticleVisibility vis, ArticleCreationType type,
			Long catId, List<String> tagNames) {
		KbArticle a = new KbArticle();
		a.setKbNumber("KB-" + System.currentTimeMillis());
		a.setTitle(title);
		a.setStatus(ArticleStatus.DRAFT);
		a.setCreatedBy(authorId != null ? authorId : 0L);
		a.setVisibility(vis != null ? vis : ArticleVisibility.EXTERNAL);
		a.setCreationType(type);
		a.setTags(new HashSet<>());
		applyCategory(a, catId);
		applyTags(a, tagNames);
		return a;
	}

	private KbArticleVersion buildFormVersion(KbArticle article, CreateArticleRequest req, int vn) {
		KbArticleVersion v = new KbArticleVersion();
		v.setArticle(article);
		v.setVersionNumber(vn);
		v.setTitle(req.getTitle());
		v.setSummary(req.getSummary());
		v.setChangeSummary(req.getChangeSummary());
		v.setCreationType(ArticleCreationType.FORM);
		v.setState(VersionStatus.DRAFT);
		v.setIsActiveVersion(false);
		v.setAuthorId(req.getAuthorId() != null ? req.getAuthorId() : 0L);
		return v;
	}

	private KbArticleVersion buildFileVersion(KbArticle article, String title, String desc, Long authorId, String path,
			String origName, String mime, long size, ArticleCreationType type, int vn) {
		KbArticleVersion v = new KbArticleVersion();
		v.setArticle(article);
		v.setVersionNumber(vn);
		v.setTitle(title);
		v.setSummary(desc);
		v.setState(VersionStatus.DRAFT);
		v.setIsActiveVersion(false);
		v.setAuthorId(authorId != null ? authorId : 0L);
		v.setCreationType(type);
		v.setAttachmentPath(path);
		v.setAttachmentOriginalName(origName);
		v.setAttachmentMimeType(mime);
		v.setAttachmentSizeBytes(size);
		return v;
	}

	// ── Mappers ───────────────────────────────────────────────────────────────

	private ArticleDetailResponse toDetail(KbArticle a, KbArticleVersion v) {
		ArticleDetailResponse r = new ArticleDetailResponse();
		r.setId(a.getId());
		r.setKbNumber(a.getKbNumber());
		r.setTitle(a.getTitle());
		r.setStatus(a.getStatus());
		r.setVisibility(a.getVisibility());
		r.setCreationType(a.getCreationType());
		r.setCurrentVersionId(v.getId());
		r.setCurrentVersionNumber(v.getVersionNumber());
		r.setSummary(v.getSummary());
		r.setChangeSummary(v.getChangeSummary());
		r.setAttachmentPath(v.getAttachmentPath());
		r.setAttachmentOriginalName(v.getAttachmentOriginalName());
		r.setAttachmentMimeType(v.getAttachmentMimeType());
		r.setAttachmentSizeBytes(v.getAttachmentSizeBytes());
		r.setAuthorId(v.getAuthorId());
		if (a.getCategory() != null) {
			r.setCategoryName(a.getCategory().getName());
			r.setCategoryId(a.getCategory().getId());
		}
		r.setTags(a.getTags().stream().map(KbTag::getName).collect(Collectors.toList()));
		r.setAverageRating(feedbackRepo.findAverageRatingByArticleId(a.getId()));
		r.setRatingCount(feedbackRepo.countByArticleId(a.getId()));
		r.setPublishedAt(fmt(v.getPublishedAt()));
		r.setCreatedAt(fmt(a.getCreatedAt()));
		r.setUpdatedAt(fmt(a.getUpdatedAt()));
		return r;
	}

	private ArticleSummaryResponse toSummary(KbArticle article) {
		ArticleSummaryResponse r = new ArticleSummaryResponse();
		r.setId(article.getId());
		r.setKbNumber(article.getKbNumber());
		r.setTitle(article.getTitle());
		r.setStatus(article.getStatus());
		r.setVisibility(article.getVisibility());
		r.setCreationType(article.getCreationType());
		if (article.getCategory() != null) {
			r.setCategoryName(article.getCategory().getName());
		}
		r.setTags(article.getTags().stream().map(KbTag::getName).collect(Collectors.toList()));

		// Always show the currently active (approved) version in summary
		KbArticleVersion ver = versionRepo.findByArticleIdAndIsActiveVersionTrue(article.getId())
				.orElseGet(() -> versionRepo.findByArticleIdOrderByVersionNumberDesc(article.getId()).stream()
						.findFirst().orElse(null));

		if (ver != null) {
			r.setSummary(ver.getSummary());
			r.setCurrentVersionId(ver.getId());
			r.setCurrentVersionNumber(ver.getVersionNumber());
			r.setPublishedAt(fmt(ver.getPublishedAt()));
		}

		r.setAverageRating(feedbackRepo.findAverageRatingByArticleId(article.getId()));
		r.setRatingCount(feedbackRepo.countByArticleId(article.getId()));
		r.setCreatedAt(fmt(article.getCreatedAt()));
		r.setUpdatedAt(fmt(article.getUpdatedAt()));
		return r;
	}

	private VersionHistoryResponse toVersionHistoryResponse(KbArticleVersion v) {
		VersionHistoryResponse r = new VersionHistoryResponse();
		r.setVersionId(v.getId());
		r.setVersionNumber(v.getVersionNumber());
		r.setTitle(v.getTitle());
		r.setState(v.getState());
		r.setAuthorId(v.getAuthorId());
		r.setChangeSummary(v.getChangeSummary());
		r.setIsActiveVersion(v.getIsActiveVersion());
		r.setSummary(v.getSummary());
		r.setSubmittedForApprovalAt(fmt(v.getSubmittedForApprovalAt()));
		r.setAttachmentOriginalName(v.getAttachmentOriginalName());
		r.setAttachmentMimeType(v.getAttachmentMimeType());
		r.setAttachmentSizeBytes(v.getAttachmentSizeBytes());
		r.setAttachmentPath(v.getAttachmentPath());
		r.setApprovedAt(fmt(v.getApprovedAt()));
		r.setApprovedBy(v.getApprovedBy());
		r.setRejectedAt(fmt(v.getRejectedAt()));
		r.setRejectedBy(v.getRejectedBy());
		r.setRejectionReason(v.getRejectionReason());
		r.setSentBackAt(fmt(v.getSentBackAt()));
		r.setSentBackBy(v.getSentBackBy());
		r.setSentBackReason(v.getSentBackReason());
		r.setPublishedAt(fmt(v.getPublishedAt()));
		r.setCreatedAt(fmt(v.getCreatedAt()));
		r.setUpdatedAt(fmt(v.getUpdatedAt()));
		return r;
	}

	private ApprovalResponse toApproval(KbApproval a) {
		ApprovalResponse r = new ApprovalResponse();
		r.setId(a.getId());
		r.setVersionId(a.getArticleVersion().getId());
		r.setApproverId(a.getApproverId());
		r.setStatus(a.getStatus());
		r.setComments(a.getComments());
		r.setDecidedAt(fmt(a.getDecidedAt()));
		r.setCreatedAt(fmt(a.getCreatedAt()));
		return r;
	}

	private FeedbackResponse toFeedback(KbFeedback f) {
		FeedbackResponse r = new FeedbackResponse();
		r.setId(f.getId());
		r.setArticleId(f.getArticle().getId());
		r.setKbNumber(f.getArticle().getKbNumber());
		r.setUserId(f.getUserId());
		r.setRating(f.getRating());
		r.setComment(f.getComment());
		r.setIsAnonymous(f.getIsAnonymous());
		r.setCreatedAt(fmt(f.getCreatedAt()));
		return r;
	}

	private CategoryResponse toCategory(KbCategory c) {
		CategoryResponse r = new CategoryResponse();
		r.setId(c.getId());
		r.setName(c.getName());
		r.setDescription(c.getDescription());
		r.setParentId(c.getParentId());
		r.setIsActive(c.getIsActive());
		return r;
	}

	private String fmt(LocalDateTime dt) {
		return dt != null ? dt.format(FMT) : null;
	}
}
