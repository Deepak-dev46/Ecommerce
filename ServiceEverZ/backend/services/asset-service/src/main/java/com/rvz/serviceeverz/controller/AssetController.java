package com.rvz.serviceeverz.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.rvz.serviceeverz.dto.request.AssetRequest;
import com.rvz.serviceeverz.dto.request.AssetStatusUpdateRequest;
import com.rvz.serviceeverz.dto.request.RentalReturnRequest;
import com.rvz.serviceeverz.dto.request.SpecSearchRequest;
import com.rvz.serviceeverz.dto.response.ApiResponse;
import com.rvz.serviceeverz.dto.response.AssetResponse;
import com.rvz.serviceeverz.dto.response.AssetStatsResponse;
import com.rvz.serviceeverz.dto.response.BulkImportResult;
import com.rvz.serviceeverz.dto.response.SpecificationTemplateResponse;
import com.rvz.serviceeverz.dto.response.TicketSummaryResponse;
import com.rvz.serviceeverz.entity.Asset;
import com.rvz.serviceeverz.enums.AssetCategory;
import com.rvz.serviceeverz.enums.AssetOwnershipType;
import com.rvz.serviceeverz.enums.AssetStatus;
import com.rvz.serviceeverz.service.AssetService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/assets")
//@CrossOrigin(origins = "http://localhost:5173")
public class AssetController {

	private final AssetService assetService;

	public AssetController(AssetService assetService) {
		this.assetService = assetService;
	}

	private <T> ApiResponse<T> ok(String msg, T d) {
		return new ApiResponse<>(true, msg, d);
	}

	@PostMapping
	public ResponseEntity<ApiResponse<AssetResponse>> add(@Valid @RequestBody AssetRequest req) {
		return ResponseEntity.status(HttpStatus.CREATED).body(ok("Asset added", assetService.addAsset(req)));
	}

	@PutMapping("/{id}")
	public ResponseEntity<ApiResponse<AssetResponse>> update(@PathVariable Long id,
			@Valid @RequestBody AssetRequest req) {
		return ResponseEntity.ok(ok("Asset updated", assetService.updateAsset(id, req)));
	}

	@PutMapping("/{id}/status")
	public ResponseEntity<ApiResponse<AssetResponse>> updateStatus(@PathVariable Long id,
			@Valid @RequestBody AssetStatusUpdateRequest req) {
		return ResponseEntity.ok(ok("Asset status updated", assetService.updateAssetStatus(id, req)));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
		assetService.deleteAsset(id);
		return ResponseEntity.ok(ok("Asset deleted", null));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<AssetResponse>> getById(@PathVariable Long id) {
		return ResponseEntity.ok(ok("Asset fetched", assetService.getAssetById(id)));
	}

	@GetMapping
	public ResponseEntity<ApiResponse<List<AssetResponse>>> getAll() {
		return ResponseEntity.ok(ok("All assets", assetService.getAllAssets()));
	}

	@GetMapping("/status/{status}")
	public ResponseEntity<ApiResponse<List<AssetResponse>>> byStatus(@PathVariable AssetStatus status) {
		return ResponseEntity.ok(ok("Assets by status", assetService.getAssetsByStatus(status)));
	}

	@GetMapping("/category/{category}")
	public ResponseEntity<ApiResponse<List<AssetResponse>>> byCategory(@PathVariable AssetCategory category) {
		return ResponseEntity.ok(ok("Assets by category", assetService.getAssetsByCategory(category)));
	}

	@GetMapping("/ownership/{type}")
	public ResponseEntity<ApiResponse<List<AssetResponse>>> byOwnership(@PathVariable AssetOwnershipType type) {
		return ResponseEntity.ok(ok("Assets by ownership", assetService.getAssetsByOwnershipType(type)));
	}

	@GetMapping("/user/{userId}")
	public ResponseEntity<ApiResponse<List<AssetResponse>>> byUser(@PathVariable Long userId) {
		return ResponseEntity.ok(ok("User assets", assetService.getAssetsByUser(userId)));
	}

	@GetMapping("/search")
	public ResponseEntity<ApiResponse<List<AssetResponse>>> search(@RequestParam(required = false) String keyword) {
		return ResponseEntity.ok(ok("Search results", assetService.searchAssets(keyword)));
	}

	@GetMapping("/search/available")
	public ResponseEntity<ApiResponse<List<AssetResponse>>> searchAvailable(
			@RequestParam(required = false) String keyword, @RequestParam(required = false) AssetCategory category) {
		List<AssetResponse> results = (category != null) ? assetService.searchAvailableAssets(keyword, category)
				: assetService.searchAvailableAssets(keyword);
		return ResponseEntity.ok(ok("Available asset search results", results));
	}

	@GetMapping("/rental/expiring-soon")
	public ResponseEntity<ApiResponse<List<AssetResponse>>> expiringSoon(@RequestParam(defaultValue = "30") int days) {
		return ResponseEntity
				.ok(ok("Rentals expiring in " + days + " days", assetService.getRentalAssetsExpiringSoon(days)));
	}

	@PutMapping("/{id}/rental/return")
	public ResponseEntity<ApiResponse<AssetResponse>> markReturned(@PathVariable Long id,
			@Valid @RequestBody RentalReturnRequest req) {
		return ResponseEntity.ok(ok("Rental returned", assetService.markRentalReturned(id, req)));
	}

	@GetMapping("/stats")
	public ResponseEntity<ApiResponse<AssetStatsResponse>> stats() {
		return ResponseEntity.ok(ok("Asset statistics", assetService.getStats()));
	}

	@PostMapping(value = "/bulk-import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<ApiResponse<BulkImportResult>> bulkImport(@RequestParam("file") MultipartFile file,
			@RequestParam("spId") Long spId) {
		return ResponseEntity.ok(ok("Bulk import completed", assetService.bulkImport(file, spId)));
	}

	// ── Invoice stream ────────────────────────────────────────────
	/**
	 * GET /api/assets/{id}/invoice
	 *
	 * Streams the stored invoice back to the browser with the correct Content-Type
	 * (application/pdf, image/jpeg, etc.) so the frontend can embed it directly
	 * inside an <iframe> or <embed> without opening a separate tab. The raw base64
	 * stored in the DB is decoded to bytes here on the fly — nothing is written to
	 * disk.
	 *
	 * Returns 404 when no invoice is attached to the asset.
	 */
	@GetMapping("/{id}/invoice")
	public ResponseEntity<byte[]> streamInvoice(@PathVariable Long id) {
		return buildInvoiceResponse(id);
	}

	private ResponseEntity<byte[]> buildInvoiceResponse(Long id) {
		try {
		Asset asset = assetService.getRawAsset(id);
			if (asset == null || asset.getInvoiceData() == null || asset.getInvoiceData().isBlank()) {
				return ResponseEntity.notFound().build();
			}
			byte[] bytes = java.util.Base64.getDecoder().decode(asset.getInvoiceData());
			String contentType = asset.getInvoiceContentType() != null ? asset.getInvoiceContentType()
					: "application/octet-stream";
			String fileName = asset.getInvoiceFileName() != null ? asset.getInvoiceFileName() : "invoice";
			return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
					.header(HttpHeaders.CONTENT_TYPE, contentType).body(bytes);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	// ── Specification-based search ─────────────────────────────
	/**
	 * POST /api/assets/search/by-specs
	 *
	 * Body example: { "specs": { "RAM": "16GB", "Storage": "512GB" }, "keyword":
	 * "Dell", "category": "LAPTOP" }
	 *
	 * Returns AVAILABLE assets matching ALL provided specs + keyword + category.
	 */
	@PostMapping("/search/by-specs")
	public ResponseEntity<ApiResponse<List<AssetResponse>>> searchBySpecs(@RequestBody SpecSearchRequest req) {
		List<AssetResponse> results = assetService.searchAssetsBySpecifications(req.getSpecs(), req.getKeyword(),
				req.getCategory() != null ? AssetCategory.valueOf(req.getCategory().toUpperCase()) : null);
		return ResponseEntity.ok(ok("Spec-filtered search results", results));
	}

	// ── Specification template ──────────────────────────────────
	/**
	 * GET /api/assets/spec-template/{category}
	 *
	 * Returns expected specification keys and their hints for a category. Frontend
	 * uses this to render the correct form fields dynamically.
	 *
	 * Example: GET /api/assets/spec-template/LAPTOP → { "category": "LAPTOP",
	 * "fields": { "RAM": "e.g. 16GB", ... } }
	 */
	@GetMapping("/spec-template/{category}")
	public ResponseEntity<ApiResponse<SpecificationTemplateResponse>> specTemplate(@PathVariable String category) {
		return ResponseEntity.ok(ok("Specification template", assetService.getSpecificationTemplate(category)));
	}

	/**
	 * GET /api/assets/spec-template Returns templates for ALL categories at once
	 * (useful for frontend to pre-load).
	 */
	@GetMapping("/spec-template")
	public ResponseEntity<ApiResponse<Map<String, Map<String, String>>>> allSpecTemplates() {
		Map<String, Map<String, String>> all = new java.util.LinkedHashMap<>();
		for (com.rvz.serviceeverz.enums.SpecificationTemplate t : com.rvz.serviceeverz.enums.SpecificationTemplate
				.values()) {
			all.put(t.name(), t.getFields());
		}
		return ResponseEntity.ok(ok("All specification templates", all));
	}

	// ── Hardware IN_PROGRESS tickets for SP ─────────────────────
	/**
	 * GET /api/assets/tickets/hardware-inprogress/{spUserId}?keyword=
	 *
	 * Fetches IN_PROGRESS + Hardware category tickets assigned to the given SP
	 * user. Used in mapping creation to let SP pick a ticket from the dropdown.
	 *
	 * @param spUserId user ID of the support personnel
	 * @param keyword  optional search on ticketNumber / subject / requesterName
	 */
	@GetMapping("/tickets/hardware-inprogress/{spUserId}")
	public ResponseEntity<ApiResponse<List<TicketSummaryResponse>>> hardwareInProgressTickets(
			@PathVariable Long spUserId, @RequestParam(required = false) String keyword) {
		return ResponseEntity.ok(
				ok("Hardware IN_PROGRESS tickets", assetService.getHardwareInProgressTicketsForSp(spUserId, keyword)));
	}

	// ── Bulk import template download ───────────────────────────
	/**
	 * GET /api/assets/bulk-import/template?category=LAPTOP
	 *
	 * Downloads a pre-filled Excel template with correct columns for the given
	 * category (including its spec columns like Spec_RAM, Spec_Storage).
	 */
	@GetMapping("/bulk-import/template")
	public ResponseEntity<byte[]> downloadBulkImportTemplate(
			@RequestParam(required = false, defaultValue = "LAPTOP") String category) {
		byte[] template = assetService.generateBulkImportTemplate(category);
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION,
						"attachment; filename=\"asset-import-template-" + category.toLowerCase() + ".xlsx\"")
				.contentType(
						MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
				.body(template);
	}
}
