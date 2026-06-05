package com.rvz.serviceeverz.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.rvz.serviceeverz.dto.request.AssetRequest;
import com.rvz.serviceeverz.dto.request.AssetStatusUpdateRequest;
import com.rvz.serviceeverz.dto.request.RentalReturnRequest;
import com.rvz.serviceeverz.dto.response.ApiResponse;
import com.rvz.serviceeverz.dto.response.AssetResponse;
import com.rvz.serviceeverz.dto.response.AssetStatsResponse;
import com.rvz.serviceeverz.dto.response.BulkImportResult;
import com.rvz.serviceeverz.enums.AssetCategory;
import com.rvz.serviceeverz.enums.AssetOwnershipType;
import com.rvz.serviceeverz.enums.AssetStatus;
import com.rvz.serviceeverz.service.AssetService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/assets")
@CrossOrigin
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
			@RequestParam(required = false) String keyword,
			@RequestParam(required = false) AssetCategory category) {
		List<AssetResponse> results = (category != null)
				? assetService.searchAvailableAssets(keyword, category)
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
}
