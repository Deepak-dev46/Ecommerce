package com.rvz.serviceeverz.service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.rvz.serviceeverz.dto.request.AssetRequest;
import com.rvz.serviceeverz.dto.request.AssetSpecificationRequest;
import com.rvz.serviceeverz.dto.request.AssetStatusUpdateRequest;
import com.rvz.serviceeverz.dto.request.RentalReturnRequest;
import com.rvz.serviceeverz.dto.response.AssetResponse;
import com.rvz.serviceeverz.dto.response.AssetSpecificationResponse;
import com.rvz.serviceeverz.dto.response.AssetStatsResponse;
import com.rvz.serviceeverz.dto.response.BulkImportResult;
import com.rvz.serviceeverz.dto.response.SpecificationTemplateResponse;
import com.rvz.serviceeverz.dto.response.TicketSummaryResponse;
import com.rvz.serviceeverz.dto.response.UserSummaryResponse;
import com.rvz.serviceeverz.entity.Asset;
import com.rvz.serviceeverz.entity.AssetSpecification;
import com.rvz.serviceeverz.enums.AssetCategory;
import com.rvz.serviceeverz.enums.AssetOwnershipType;
import com.rvz.serviceeverz.enums.AssetStatus;
import com.rvz.serviceeverz.enums.SpecificationTemplate;
import com.rvz.serviceeverz.exceptions.AssetNotFoundException;
import com.rvz.serviceeverz.feign.TicketFeignClient;
import com.rvz.serviceeverz.feign.UserServiceClient;
import com.rvz.serviceeverz.repository.AssetRepository;
import com.rvz.serviceeverz.repository.AssetSpecificationRepository;

@Service
public class AssetServiceImpl implements AssetService {

	private static final Logger log = LoggerFactory.getLogger(AssetServiceImpl.class);
	private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
	private static final DataFormatter DATA_FORMATTER = new DataFormatter();

	private final AssetRepository assetRepo;
	private final AssetSpecificationRepository specRepo;
	private final UserServiceClient userClient;
	private final TicketFeignClient ticketClient;

	public AssetServiceImpl(AssetRepository assetRepo, AssetSpecificationRepository specRepo,
			UserServiceClient userClient, TicketFeignClient ticketClient) {
		this.assetRepo = assetRepo;
		this.specRepo = specRepo;
		this.userClient = userClient;
		this.ticketClient = ticketClient;
	}

	// ── Name resolver via UMS Feign ──────────────────────────────
	private UserSummaryResponse fetchUser(Long userId) {
		if (userId == null)
			return null;
		try {
			return userClient.getUserById(userId);
		} catch (Exception e) {
			log.warn("Failed to fetch user {} from user-service: {}", userId, e.getMessage());
			return null;
		}
	}

	private String resolveName(Long userId) {
		if (userId == null)
			return null;
		UserSummaryResponse u = fetchUser(userId);
		return u != null ? u.getFullName() : null;
	}

	// ── Entity → Response ────────────────────────────────────────
	private AssetResponse toResponse(Asset a) {
		AssetResponse r = new AssetResponse();
		r.setId(a.getId());
		r.setAssetTag(a.getAssetTag());
		r.setName(a.getName());
		r.setCategory(a.getCategory());
		r.setBrand(a.getBrand());
		r.setModel(a.getModel());
		r.setSerialNumber(a.getSerialNumber());
		r.setLocation(a.getLocation());
		r.setStatus(a.getStatus());
		r.setAssignedToUserId(a.getAssignedToUserId());
		r.setAssignedToUserName(resolveName(a.getAssignedToUserId()));
		r.setAddedBySpId(a.getAddedBySpId());
		r.setAddedBySpName(resolveName(a.getAddedBySpId()));
		r.setNotes(a.getNotes());
		r.setOwnershipType(a.getOwnershipType());
		r.setCreatedAt(a.getCreatedAt());
		r.setUpdatedAt(a.getUpdatedAt());

		// Invoice fields — only expose metadata; raw data is fetched via /invoice
		// endpoint
		r.setHasInvoice(a.getInvoiceData() != null && !a.getInvoiceData().isBlank());
		r.setInvoiceContentType(a.getInvoiceContentType());
		r.setInvoiceFileName(a.getInvoiceFileName());

		// Specifications
		List<AssetSpecificationResponse> specs = specRepo.findByAssetId(a.getId()).stream()
				.map(s -> new AssetSpecificationResponse(s.getSpecKey(), s.getSpecValue()))
				.collect(Collectors.toList());
		r.setSpecifications(specs);

		if (a.getOwnershipType() == AssetOwnershipType.OWNED) {
			r.setPurchaseDate(a.getPurchaseDate());
			r.setPurchaseCost(a.getPurchaseCost());
			r.setWarrantyExpiryDate(a.getWarrantyExpiryDate());
			r.setDepreciationRatePercent(a.getDepreciationRatePercent());
		} else if (a.getOwnershipType() == AssetOwnershipType.RENTAL) {
			r.setRentalVendorName(a.getRentalVendorName());
			r.setRentalVendorContact(a.getRentalVendorContact());
			r.setRentalVendorEmail(a.getRentalVendorEmail());
			r.setRentalContractNumber(a.getRentalContractNumber());
			r.setRentalStartDate(a.getRentalStartDate());
			r.setRentalEndDate(a.getRentalEndDate());
			r.setRentalCostPerMonth(a.getRentalCostPerMonth());
			r.setRentalDepositAmount(a.getRentalDepositAmount());
			r.setRentalRenewalOption(a.getRentalRenewalOption());
			r.setRentalReturnCondition(a.getRentalReturnCondition());
			r.setRentalReturnedDate(a.getRentalReturnedDate());
			if (a.getRentalEndDate() != null && a.getRentalReturnedDate() == null)
				r.setRentalExpiringSoon(!a.getRentalEndDate().isAfter(LocalDate.now().plusDays(30)));
		}
		return r;
	}

	// ── Spec sync helper ─────────────────────────────────────────
	@Transactional
	private void syncSpecifications(Asset asset, List<AssetSpecificationRequest> incoming) {
		specRepo.deleteByAssetId(asset.getId());
		if (incoming == null || incoming.isEmpty())
			return;
		for (AssetSpecificationRequest req : incoming) {
			AssetSpecification spec = new AssetSpecification();
			spec.setAsset(asset);
			spec.setSpecKey(req.getSpecKey().trim());
			spec.setSpecValue(req.getSpecValue().trim());
			specRepo.save(spec);
		}
	}

	private void applyRequest(Asset a, AssetRequest req) {
		a.setName(req.getName());
		a.setCategory(req.getCategory());
		a.setBrand(req.getBrand());
		a.setModel(req.getModel());
		a.setSerialNumber(req.getSerialNumber());
		a.setLocation(req.getLocation());
		a.setNotes(req.getNotes());
		a.setOwnershipType(req.getOwnershipType());
		a.setPurchaseDate(req.getPurchaseDate());
		a.setPurchaseCost(req.getPurchaseCost());
		a.setWarrantyExpiryDate(req.getWarrantyExpiryDate());
		a.setDepreciationRatePercent(req.getDepreciationRatePercent());
		a.setRentalVendorName(req.getRentalVendorName());
		a.setRentalVendorContact(req.getRentalVendorContact());
		a.setRentalVendorEmail(req.getRentalVendorEmail());
		a.setRentalContractNumber(req.getRentalContractNumber());
		a.setRentalStartDate(req.getRentalStartDate());
		a.setRentalEndDate(req.getRentalEndDate());
		a.setRentalCostPerMonth(req.getRentalCostPerMonth());
		a.setRentalDepositAmount(req.getRentalDepositAmount());
		a.setRentalRenewalOption(req.getRentalRenewalOption());
		a.setRentalReturnCondition(req.getRentalReturnCondition());
		a.setInvoiceData(req.getInvoiceData());
		a.setInvoiceContentType(req.getInvoiceContentType());
		a.setInvoiceFileName(req.getInvoiceFileName());
	}

	private void validateRental(AssetRequest req) {
		if (req.getOwnershipType() == AssetOwnershipType.RENTAL) {
			if (req.getRentalVendorName() == null || req.getRentalVendorName().isBlank())
				throw new IllegalStateException("Rental vendor name is required for RENTAL assets.");
			if (req.getRentalStartDate() == null || req.getRentalEndDate() == null)
				throw new IllegalStateException("Rental start and end dates are required for RENTAL assets.");
			if (req.getRentalEndDate().isBefore(req.getRentalStartDate()))
				throw new IllegalStateException("Rental end date cannot be before start date.");
		}
	}

	// ── CRUD ─────────────────────────────────────────────────────
	@Override
	@Transactional
	public AssetResponse addAsset(AssetRequest request) {
		validateRental(request);
		if (request.getSerialNumber() != null && !request.getSerialNumber().isBlank()
				&& assetRepo.existsBySerialNumberAndIsDeletedFalse(request.getSerialNumber()))
			throw new IllegalStateException("Serial number already exists: " + request.getSerialNumber());

		Asset a = new Asset();
		applyRequest(a, request);
		a.setAssetTag("ASSET-TEMP-" + System.nanoTime());
		a.setStatus(AssetStatus.AVAILABLE);
		a.setAddedBySpId(request.getAddedBySpId());
		a = assetRepo.save(a);
		a.setAssetTag(String.format("ASSET-%06d", a.getId()));
		a = assetRepo.save(a);

		syncSpecifications(a, request.getSpecifications());
		log.info("Asset added: {} [{}]", a.getAssetTag(), a.getOwnershipType());
		return toResponse(a);
	}

	@Override
	@Transactional
	public AssetResponse updateAsset(Long id, AssetRequest request) {
		validateRental(request);
		Asset a = assetRepo.findById(id).filter(x -> !x.getIsDeleted())
				.orElseThrow(() -> new AssetNotFoundException("Asset not found: " + id));
		applyRequest(a, request);
		a = assetRepo.save(a);
		syncSpecifications(a, request.getSpecifications());
		return toResponse(a);
	}

	@Override
	public AssetResponse updateAssetStatus(Long id, AssetStatusUpdateRequest request) {
		Asset a = assetRepo.findById(id).filter(x -> !x.getIsDeleted())
				.orElseThrow(() -> new AssetNotFoundException("Asset not found: " + id));
		AssetStatus newStatus = request.getStatus();
		if (newStatus == AssetStatus.ASSIGNED)
			throw new IllegalStateException("Status ASSIGNED is controlled by the asset-mapping workflow.");
		if (a.getStatus() == AssetStatus.ASSIGNED && newStatus != AssetStatus.UNDER_MAINTENANCE
				&& newStatus != AssetStatus.LOST)
			throw new IllegalStateException(
					"Asset is ASSIGNED. Release mapping before changing status to " + newStatus + ".");
		a.setStatus(newStatus);
		if (request.getRemarks() != null && !request.getRemarks().isBlank())
			a.setNotes(request.getRemarks());
		return toResponse(assetRepo.save(a));
	}

	@Override
	public void deleteAsset(Long id) {
		Asset a = assetRepo.findById(id).filter(x -> !x.getIsDeleted())
				.orElseThrow(() -> new AssetNotFoundException("Asset not found: " + id));
		if (a.getStatus() == AssetStatus.ASSIGNED)
			throw new IllegalStateException("Cannot delete an assigned asset.");
		a.setIsDeleted(true);
		assetRepo.save(a);
	}

	@Override
	public AssetResponse getAssetById(Long id) {
		return toResponse(assetRepo.findById(id).filter(a -> !a.getIsDeleted())
				.orElseThrow(() -> new AssetNotFoundException("Asset not found: " + id)));
	}

	@Override
	public List<AssetResponse> getAllAssets() {
		return assetRepo.findAllByIsDeletedFalseOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
	}

	@Override
	public List<AssetResponse> getAssetsByStatus(AssetStatus s) {
		return assetRepo.findAllByStatusAndIsDeletedFalse(s).stream().map(this::toResponse).toList();
	}

	@Override
	public List<AssetResponse> getAssetsByCategory(AssetCategory c) {
		return assetRepo.findAllByCategoryAndIsDeletedFalse(c).stream().map(this::toResponse).toList();
	}

	@Override
	public List<AssetResponse> getAssetsByOwnershipType(AssetOwnershipType t) {
		return assetRepo.findAllByOwnershipTypeAndIsDeletedFalse(t).stream().map(this::toResponse).toList();
	}

	@Override
	public List<AssetResponse> getAssetsByUser(Long userId) {
		return assetRepo.findAllByAssignedToUserIdAndIsDeletedFalse(userId).stream().map(this::toResponse).toList();
	}

	@Override
	public List<AssetResponse> searchAssets(String keyword) {
		if (keyword == null || keyword.isBlank())
			return getAllAssets();
		return assetRepo.searchByKeyword(keyword.trim()).stream().map(this::toResponse).toList();
	}

	@Override
	public List<AssetResponse> searchAvailableAssets(String keyword) {
		return searchAvailableAssets(keyword, null);
	}

	/**
	 * FIX: Handle null category properly. - keyword blank + category null → return
	 * all AVAILABLE assets - keyword blank + category set → filter by category only
	 * - keyword present → use keyword-based DB query (handles null category via
	 * overloaded methods)
	 */
	@Override
	public List<AssetResponse> searchAvailableAssets(String keyword, AssetCategory category) {
		boolean hasKeyword = keyword != null && !keyword.isBlank();
		if (!hasKeyword) {
			if (category == null) {
				// All available assets, no filter
				return assetRepo.findAllByStatusAndIsDeletedFalse(AssetStatus.AVAILABLE).stream().map(this::toResponse)
						.toList();
			}
			// Available assets filtered by category only
			return assetRepo.findAllByCategoryAndStatusAndIsDeletedFalse(category, AssetStatus.AVAILABLE).stream()
					.map(this::toResponse).toList();
		}
		// Keyword present: use appropriate query
		if (category == null) {
			return assetRepo.searchAvailableByKeyword(keyword.trim()).stream().map(this::toResponse).toList();
		}
		return assetRepo.searchAvailableByKeywordAndCategory(keyword.trim(), category).stream().map(this::toResponse)
				.toList();
	}

	@Override
	public List<AssetResponse> getRentalAssetsExpiringSoon(int days) {
		return assetRepo.findRentalAssetsExpiringSoon(LocalDate.now().plusDays(days)).stream().map(this::toResponse)
				.toList();
	}

	@Override
	public AssetResponse markRentalReturned(Long id, RentalReturnRequest request) {
		Asset a = assetRepo.findById(id).filter(x -> !x.getIsDeleted())
				.orElseThrow(() -> new AssetNotFoundException("Asset not found: " + id));
		if (a.getOwnershipType() != AssetOwnershipType.RENTAL)
			throw new IllegalStateException("Asset is not a rental asset.");
		if (a.getStatus() == AssetStatus.ASSIGNED)
			throw new IllegalStateException("Release the mapping before returning to vendor.");
		a.setRentalReturnedDate(request.getReturnedDate());
		a.setStatus(AssetStatus.RETURNED_TO_VENDOR);
		if (request.getRemarks() != null)
			a.setNotes(request.getRemarks());
		return toResponse(assetRepo.save(a));
	}

	@Override
	public AssetStatsResponse getStats() {
		AssetStatsResponse s = new AssetStatsResponse();
		s.setTotalAssets(assetRepo.findAllByIsDeletedFalseOrderByCreatedAtDesc().size());
		s.setAvailableAssets(assetRepo.countByStatus(AssetStatus.AVAILABLE));
		s.setAssignedAssets(assetRepo.countByStatus(AssetStatus.ASSIGNED));
		s.setUnderMaintenanceAssets(assetRepo.countByStatus(AssetStatus.UNDER_MAINTENANCE));
		s.setRetiredAssets(assetRepo.countByStatus(AssetStatus.RETIRED));
		s.setOwnedAssets(assetRepo.countByOwnershipType(AssetOwnershipType.OWNED));
		s.setRentalAssets(assetRepo.countByOwnershipType(AssetOwnershipType.RENTAL));
		s.setRentalExpiringSoon(assetRepo.findRentalAssetsExpiringSoon(LocalDate.now().plusDays(30)).size());
		Map<String, Long> byCat = new LinkedHashMap<>();
		for (AssetCategory c : AssetCategory.values())
			byCat.put(c.name(), assetRepo.countByCategory(c));
		s.setCountByCategory(byCat);
		return s;
	}

	// ── Specification-based search (FIXED: uses DB query) ───────
	/**
	 * FIX: replaced in-memory stream filter with the proper DB query
	 * searchAvailableBySpecIds() which pushes the asset ID filter into SQL. This is
	 * both correct and efficient.
	 *
	 * Logic: 1. For each spec key/value pair, find matching asset IDs via specRepo.
	 * 2. AND them together (intersection). 3. Pass the resulting IDs + keyword +
	 * category to a single DB query. 4. If no spec filters given, search all
	 * available assets by keyword/category.
	 */
	@Override
	public List<AssetResponse> searchAssetsBySpecifications(Map<String, String> specs, String keyword,
			AssetCategory category) {

		List<Long> eligibleIds = null;

		if (specs != null && !specs.isEmpty()) {
			for (Map.Entry<String, String> entry : specs.entrySet()) {
				List<Long> matchingIds = specRepo.findAssetIdsBySpec(entry.getKey(), entry.getValue());
				if (eligibleIds == null) {
					eligibleIds = new ArrayList<>(matchingIds);
				} else {
					eligibleIds.retainAll(matchingIds); // AND logic
				}
				if (eligibleIds.isEmpty())
					return Collections.emptyList();
			}
		}

		// Normalise keyword to null when blank so the DB query handles it correctly
		String kw = (keyword == null || keyword.isBlank()) ? null : keyword.trim();

		if (eligibleIds != null) {
			// Use DB-level filtering with the resolved asset IDs
			return assetRepo.searchAvailableBySpecIds(eligibleIds, kw, category).stream().map(this::toResponse)
					.toList();
		}

		// No spec filters — fall back to plain available search
		return searchAvailableAssets(kw, category);
	}

	// ── Specification template ────────────────────────────────────
	@Override
	public SpecificationTemplateResponse getSpecificationTemplate(String category) {
		SpecificationTemplate tmpl = SpecificationTemplate.forCategory(category);
		return new SpecificationTemplateResponse(category != null ? category.toUpperCase() : "OTHER", tmpl.getFields());
	}

	// ── Hardware IN_PROGRESS tickets for SP ──────────────────────
	/**
	 * FIX CONFIRMED: Filter is correctly applied — only IN_PROGRESS + Hardware.
	 * Tickets assigned to the SP that are in IN_PROGRESS state are returned.
	 */
	@Override
	public List<TicketSummaryResponse> getHardwareInProgressTicketsForSp(Long spUserId, String keyword) {
		List<TicketSummaryResponse> tickets;
		try {
			tickets = ticketClient.getTicketsByAssignee(spUserId);
		} catch (Exception e) {
			log.error("Failed to fetch tickets for spUserId={}: {}", spUserId, e.getMessage());
			return Collections.emptyList();
		}
		if (tickets == null)
			return Collections.emptyList();

		return tickets.stream()
				// Filter: only IN_PROGRESS tickets (tickets assigned to this person must be in
				// IN_PROGRESS state)
				.filter(t -> "IN_PROGRESS".equalsIgnoreCase(t.getStatus()))
				// Filter: only Hardware category
				.filter(t -> "Hardware".equalsIgnoreCase(t.getSubCategory()))
				// Optional keyword search on ticketNumber / subject / requesterName
				.filter(t -> keyword == null || keyword.isBlank() || containsIgnoreCase(t.getTicketNumber(), keyword)
						|| containsIgnoreCase(t.getSubject(), keyword)
						|| containsIgnoreCase(t.getSubCategory(), keyword)
						|| containsIgnoreCase(t.getRequesterName(), keyword))
				.toList();
	}

	// ── Bulk import template generator ────────────────────────────
	@Override
	public byte[] generateBulkImportTemplate(String category) {
		SpecificationTemplate tmpl = SpecificationTemplate.forCategory(category);
		Map<String, String> specFields = tmpl.getFields();

		try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

			Sheet sheet = wb.createSheet("Assets");

			List<String> headers = new ArrayList<>(Arrays.asList("#", "Name*", "Category*", "Brand", "Model",
					"SerialNumber", "Location", "OwnershipType*", "PurchaseDate(yyyy-MM-dd)", "PurchaseCost",
					"WarrantyExpiry(yyyy-MM-dd)", "DepreciationRate%", "RentalVendorName", "RentalVendorContact",
					"RentalContractNo", "RentalStartDate(yyyy-MM-dd)", "RentalEndDate(yyyy-MM-dd)",
					"RentalCostPerMonth", "RentalDepositAmount", "RentalRenewalOption", "Notes", "InvoiceBase64",
					"InvoiceContentType", "InvoiceFileName"));
			for (String key : specFields.keySet())
				headers.add("Spec_" + key);

			CellStyle headerStyle = wb.createCellStyle();
			Font hf = wb.createFont();
			hf.setBold(true);
			headerStyle.setFont(hf);
			headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
			headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

			Row headerRow = sheet.createRow(0);
			for (int i = 0; i < headers.size(); i++) {
				Cell cell = headerRow.createCell(i);
				cell.setCellValue(headers.get(i));
				cell.setCellStyle(headerStyle);
				sheet.setColumnWidth(i, 6000);
			}

			Row sample = sheet.createRow(1);
			sample.createCell(0).setCellValue(1);
			sample.createCell(1).setCellValue("Sample Asset");
			sample.createCell(2).setCellValue(category != null ? category.toUpperCase() : "LAPTOP");
			sample.createCell(3).setCellValue("Dell");
			sample.createCell(4).setCellValue("Latitude 5540");
			sample.createCell(5).setCellValue("SN-001-SAMPLE");
			sample.createCell(6).setCellValue("Chennai HQ");
			sample.createCell(7).setCellValue("OWNED");
			sample.createCell(8).setCellValue("2024-01-15");
			sample.createCell(9).setCellValue(75000.0);
			sample.createCell(10).setCellValue("2027-01-15");
			sample.createCell(11).setCellValue(20.0);
			sample.createCell(20).setCellValue(""); // Notes
			sample.createCell(21).setCellValue("(auto-filled when you upload a matching invoice ZIP — leave blank)");
			sample.createCell(22).setCellValue("application/pdf");
			sample.createCell(23).setCellValue("INV001.pdf");
			int col = 24;  // Spec columns start after InvoiceFileName (col 23)
			for (String hint : specFields.values()) {
				sample.createCell(col++).setCellValue(hint);
			}

			wb.write(out);
			return out.toByteArray();

		} catch (Exception e) {
			log.error("Failed to generate bulk import template: {}", e.getMessage());
			throw new RuntimeException("Template generation failed", e);
		}
	}

	// ── Bulk import ───────────────────────────────────────────────
	@Override
	@Transactional
	public BulkImportResult bulkImport(MultipartFile file, Long spId) {
		BulkImportResult result = new BulkImportResult();
		List<String> errors = new ArrayList<>();
		int total = 0, success = 0;

		try (InputStream is = file.getInputStream(); Workbook wb = new XSSFWorkbook(is)) {
			Sheet sheet = wb.getSheetAt(0);
			Row headerRow = sheet.getRow(0);
			if (headerRow == null)
				throw new IllegalArgumentException("Empty file");

			Map<String, Integer> headerIdx = new LinkedHashMap<>();
			for (int c = 0; c < headerRow.getLastCellNum(); c++) {
				String h = DATA_FORMATTER.formatCellValue(headerRow.getCell(c)).trim();
				if (!h.isBlank())
					headerIdx.put(h, c);
			}

			for (int i = 1; i <= sheet.getLastRowNum(); i++) {
				Row row = sheet.getRow(i);
				if (row == null)
					continue;
				total++;
				try {
					AssetRequest req = new AssetRequest();
					req.setName(cellStr(row, headerIdx.getOrDefault("Name*", 1)));
					String catStr = cellStr(row, headerIdx.getOrDefault("Category*", 2));
					req.setCategory(AssetCategory.valueOf(catStr.toUpperCase()));
					req.setBrand(cellStr(row, headerIdx.getOrDefault("Brand", 3)));
					req.setModel(cellStr(row, headerIdx.getOrDefault("Model", 4)));
					req.setSerialNumber(cellStr(row, headerIdx.getOrDefault("SerialNumber", 5)));
					req.setLocation(cellStr(row, headerIdx.getOrDefault("Location", 6)));
					String ownStr = cellStr(row, headerIdx.getOrDefault("OwnershipType*", 7));
					req.setOwnershipType(AssetOwnershipType.valueOf(ownStr.toUpperCase()));
					req.setPurchaseDate(parseDate(cellStr(row, headerIdx.getOrDefault("PurchaseDate(yyyy-MM-dd)", 8))));
					req.setPurchaseCost(parseDouble(cellStr(row, headerIdx.getOrDefault("PurchaseCost", 9))));
					req.setWarrantyExpiryDate(
							parseDate(cellStr(row, headerIdx.getOrDefault("WarrantyExpiry(yyyy-MM-dd)", 10))));
					req.setDepreciationRatePercent(
							parseDouble(cellStr(row, headerIdx.getOrDefault("DepreciationRate%", 11))));
					req.setRentalVendorName(cellStr(row, headerIdx.getOrDefault("RentalVendorName", 12)));
					req.setRentalVendorContact(cellStr(row, headerIdx.getOrDefault("RentalVendorContact", 13)));
					req.setRentalContractNumber(cellStr(row, headerIdx.getOrDefault("RentalContractNo", 14)));
					req.setRentalStartDate(
							parseDate(cellStr(row, headerIdx.getOrDefault("RentalStartDate(yyyy-MM-dd)", 15))));
					req.setRentalEndDate(
							parseDate(cellStr(row, headerIdx.getOrDefault("RentalEndDate(yyyy-MM-dd)", 16))));
					req.setRentalCostPerMonth(
							parseDouble(cellStr(row, headerIdx.getOrDefault("RentalCostPerMonth", 17))));
					req.setRentalDepositAmount(
							parseDouble(cellStr(row, headerIdx.getOrDefault("RentalDepositAmount", 18))));
					String renewal = cellStr(row, headerIdx.getOrDefault("RentalRenewalOption", 19));
					req.setRentalRenewalOption(renewal == null ? null : Boolean.parseBoolean(renewal));
					req.setNotes(cellStr(row, headerIdx.getOrDefault("Notes", 20)));

					// Invoice stored as base64; InvoiceBase64=21, InvoiceContentType=22,
					// InvoiceFileName=23
					req.setInvoiceData(cellStr(row, headerIdx.getOrDefault("InvoiceBase64", 21)));
					req.setInvoiceContentType(cellStr(row, headerIdx.getOrDefault("InvoiceContentType", 22)));
					req.setInvoiceFileName(cellStr(row, headerIdx.getOrDefault("InvoiceFileName", 23)));
					req.setAddedBySpId(spId);

					// Parse spec columns (Spec_RAM, Spec_Storage, etc.)
					List<AssetSpecificationRequest> specs = new ArrayList<>();
					for (Map.Entry<String, Integer> h : headerIdx.entrySet()) {
						if (h.getKey().startsWith("Spec_")) {
							String specKey = h.getKey().substring(5);
							String specVal = cellStr(row, h.getValue());
							if (specVal != null && !specVal.isBlank()) {
								AssetSpecificationRequest sr = new AssetSpecificationRequest();
								sr.setSpecKey(specKey);
								sr.setSpecValue(specVal);
								specs.add(sr);
							}
						}
					}
					req.setSpecifications(specs);

					addAsset(req);
					success++;
				} catch (Exception e) {
					errors.add("Row " + (i + 1) + ": " + e.getMessage());
					log.warn("Bulk import row {} failed: {}", i + 1, e.getMessage());
				}
			}
		} catch (Exception e) {
			log.error("Bulk import failed: {}", e.getMessage());
			errors.add("File processing error: " + e.getMessage());
		}

		result.setTotalRows(total);
		result.setSuccessCount(success);
		result.setFailureCount(total - success);
		result.setErrors(errors);
		return result;
	}

	// ── Utilities ────────────────────────────────────────────────
	private String cellStr(Row row, int col) {
		if (col < 0)
			return null;
		Cell cell = row.getCell(col);
		if (cell == null)
			return null;
		String v = DATA_FORMATTER.formatCellValue(cell).trim();
		return v.isBlank() ? null : v;
	}

	private LocalDate parseDate(String s) {
		if (s == null || s.isBlank())
			return null;
		try {
			return LocalDate.parse(s.trim(), DATE_FMT);
		} catch (Exception e) {
			return null;
		}
	}

	private Double parseDouble(String s) {
		if (s == null || s.isBlank())
			return null;
		try {
			return Double.parseDouble(s.trim());
		} catch (Exception e) {
			return null;
		}
	}

	private boolean containsIgnoreCase(String field, String keyword) {
		return field != null && field.toLowerCase().contains(keyword.toLowerCase());
	}

	// ── Invoice raw entity access ─────────────────────────────────
	@Override
	public com.rvz.serviceeverz.entity.Asset getRawAsset(Long id) {
		return assetRepo.findById(id).filter(a -> !Boolean.TRUE.equals(a.getIsDeleted())).orElse(null);
	}
}
