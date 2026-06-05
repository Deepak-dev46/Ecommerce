package com.rvz.serviceeverz.service;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.rvz.serviceeverz.dto.request.AssetRequest;
import com.rvz.serviceeverz.dto.request.AssetStatusUpdateRequest;
import com.rvz.serviceeverz.dto.request.RentalReturnRequest;
import com.rvz.serviceeverz.dto.response.AssetResponse;
import com.rvz.serviceeverz.dto.response.AssetStatsResponse;
import com.rvz.serviceeverz.dto.response.BulkImportResult;
import com.rvz.serviceeverz.dto.response.UserSummaryResponse;
import com.rvz.serviceeverz.entity.Asset;
import com.rvz.serviceeverz.enums.AssetCategory;
import com.rvz.serviceeverz.enums.AssetOwnershipType;
import com.rvz.serviceeverz.enums.AssetStatus;
import com.rvz.serviceeverz.exceptions.AssetNotFoundException;
import com.rvz.serviceeverz.feign.UserServiceClient;
import com.rvz.serviceeverz.notification.AssetNotificationService;
import com.rvz.serviceeverz.repository.AssetRepository;

@Service
public class AssetServiceImpl implements AssetService {

	private static final Logger log = LoggerFactory.getLogger(AssetServiceImpl.class);
	private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
	private static final DataFormatter DATA_FORMATTER = new DataFormatter();

	private final AssetRepository assetRepo;
	private final AssetNotificationService notifService;
	private final UserServiceClient userClient;

	public AssetServiceImpl(AssetRepository assetRepo, AssetNotificationService notifService,
			UserServiceClient userClient) {
		this.assetRepo = assetRepo;
		this.notifService = notifService;
		this.userClient = userClient;
	}

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
		UserSummaryResponse user = fetchUser(userId);
		return user != null ? user.getFullName() : null;
	}

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

		if (a.getOwnershipType() == AssetOwnershipType.OWNED) {
			r.setPurchaseDate(a.getPurchaseDate());
			r.setPurchaseCost(a.getPurchaseCost());
			r.setWarrantyExpiryDate(a.getWarrantyExpiryDate());
			r.setDepreciationRatePercent(a.getDepreciationRatePercent());
		} else if (a.getOwnershipType() == AssetOwnershipType.RENTAL) {
			r.setRentalVendorName(a.getRentalVendorName());
			r.setRentalVendorContact(a.getRentalVendorContact());
			r.setRentalContractNumber(a.getRentalContractNumber());
			r.setRentalStartDate(a.getRentalStartDate());
			r.setRentalEndDate(a.getRentalEndDate());
			r.setRentalCostPerMonth(a.getRentalCostPerMonth());
			r.setRentalDepositAmount(a.getRentalDepositAmount());
			r.setRentalRenewalOption(a.getRentalRenewalOption());
			r.setRentalReturnCondition(a.getRentalReturnCondition());
			r.setRentalReturnedDate(a.getRentalReturnedDate());
			if (a.getRentalEndDate() != null && a.getRentalReturnedDate() == null) {
				r.setRentalExpiringSoon(!a.getRentalEndDate().isAfter(LocalDate.now().plusDays(30)));
			}
		}
		return r;
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
		a.setRentalContractNumber(req.getRentalContractNumber());
		a.setRentalStartDate(req.getRentalStartDate());
		a.setRentalEndDate(req.getRentalEndDate());
		a.setRentalCostPerMonth(req.getRentalCostPerMonth());
		a.setRentalDepositAmount(req.getRentalDepositAmount());
		a.setRentalRenewalOption(req.getRentalRenewalOption());
		a.setRentalReturnCondition(req.getRentalReturnCondition());
	}

	private void validateRental(AssetRequest req) {
		if (req.getOwnershipType() == AssetOwnershipType.RENTAL) {
			if (req.getRentalVendorName() == null || req.getRentalVendorName().isBlank()) {
				throw new IllegalStateException("Rental vendor name is required for RENTAL assets.");
			}
			if (req.getRentalStartDate() == null || req.getRentalEndDate() == null) {
				throw new IllegalStateException("Rental start and end dates are required for RENTAL assets.");
			}
			if (req.getRentalEndDate().isBefore(req.getRentalStartDate())) {
				throw new IllegalStateException("Rental end date cannot be before start date.");
			}
		}
	}

	@Override
	public AssetResponse addAsset(AssetRequest request) {
		validateRental(request);
		if (request.getSerialNumber() != null && !request.getSerialNumber().isBlank()
				&& assetRepo.existsBySerialNumberAndIsDeletedFalse(request.getSerialNumber())) {
			throw new IllegalStateException("Serial number already exists: " + request.getSerialNumber());
		}
		Asset a = new Asset();
		applyRequest(a, request);
		a.setAssetTag("ASSET-TEMP-" + System.nanoTime());
		a.setStatus(AssetStatus.AVAILABLE);
		a.setAddedBySpId(request.getAddedBySpId());
		a = assetRepo.save(a);
		a.setAssetTag(String.format("ASSET-%06d", a.getId()));
		a = assetRepo.save(a);
		log.info("Asset added: {} [{}]", a.getAssetTag(), a.getOwnershipType());
		return toResponse(a);
	}

	@Override
	public AssetResponse updateAsset(Long id, AssetRequest request) {
		validateRental(request);
		Asset a = assetRepo.findById(id).filter(x -> !x.getIsDeleted())
				.orElseThrow(() -> new AssetNotFoundException("Asset not found: " + id));
		applyRequest(a, request);
		return toResponse(assetRepo.save(a));
	}

	@Override
	public AssetResponse updateAssetStatus(Long id, AssetStatusUpdateRequest request) {
		Asset a = assetRepo.findById(id).filter(x -> !x.getIsDeleted())
				.orElseThrow(() -> new AssetNotFoundException("Asset not found: " + id));
		AssetStatus newStatus = request.getStatus();
		if (newStatus == AssetStatus.ASSIGNED) {
			throw new IllegalStateException(
					"Status ASSIGNED is controlled by the asset-mapping workflow and cannot be set manually.");
		}
		if (a.getStatus() == AssetStatus.ASSIGNED && newStatus != AssetStatus.UNDER_MAINTENANCE
				&& newStatus != AssetStatus.LOST) {
			throw new IllegalStateException(
					"Asset is currently ASSIGNED. Release the mapping before changing status to " + newStatus + ".");
		}
		a.setStatus(newStatus);
		if (request.getRemarks() != null && !request.getRemarks().isBlank()) {
			a.setNotes(request.getRemarks());
		}
		log.info("Asset {} status manually updated to {}", a.getAssetTag(), newStatus);
		return toResponse(assetRepo.save(a));
	}

	@Override
	public void deleteAsset(Long id) {
		Asset a = assetRepo.findById(id).filter(x -> !x.getIsDeleted())
				.orElseThrow(() -> new AssetNotFoundException("Asset not found: " + id));
		if (a.getStatus() == AssetStatus.ASSIGNED) {
			throw new IllegalStateException("Cannot delete an assigned asset.");
		}
		a.setIsDeleted(true);
		assetRepo.save(a);
	}

	@Override
	public AssetResponse getAssetById(Long id) {
		Asset a = assetRepo.findById(id).filter(x -> !x.getIsDeleted())
				.orElseThrow(() -> new AssetNotFoundException("Asset not found: " + id));
		return toResponse(a);
	}

	@Override
	public List<AssetResponse> getAllAssets() {
		return assetRepo.findAllByIsDeletedFalseOrderByCreatedAtDesc().stream().map(a -> toResponse(a)).toList();
	}

	@Override
	public List<AssetResponse> getAssetsByStatus(AssetStatus status) {
		return assetRepo.findAllByStatusAndIsDeletedFalse(status).stream().map(a -> toResponse(a)).toList();
	}

	@Override
	public List<AssetResponse> getAssetsByCategory(AssetCategory category) {
		return assetRepo.findAllByCategoryAndIsDeletedFalse(category).stream().map(a -> toResponse(a)).toList();
	}

	@Override
	public List<AssetResponse> getAssetsByOwnershipType(AssetOwnershipType type) {
		return assetRepo.findAllByOwnershipTypeAndIsDeletedFalse(type).stream().map(a -> toResponse(a)).toList();
	}

	@Override
	public List<AssetResponse> getAssetsByUser(Long userId) {
		return assetRepo.findAllByAssignedToUserIdAndIsDeletedFalse(userId).stream().map(a -> toResponse(a)).toList();
	}

	@Override
	public List<AssetResponse> searchAssets(String keyword) {
		if (keyword == null || keyword.isBlank()) {
			return getAllAssets();
		}
		return assetRepo.searchByKeyword(keyword.trim()).stream().map(a -> toResponse(a)).toList();
	}

	@Override
	public List<AssetResponse> searchAvailableAssets(String keyword) {
		if (keyword == null || keyword.isBlank())
			return assetRepo.findAllByStatusAndIsDeletedFalse(AssetStatus.AVAILABLE).stream().map(this::toResponse)
					.toList();
		return assetRepo.searchAvailableByKeyword(keyword.trim()).stream().map(this::toResponse).toList();
	}

	@Override
	public List<AssetResponse> searchAvailableAssets(String keyword, AssetCategory category) {
		if (category == null)
			return searchAvailableAssets(keyword);
		if (keyword == null || keyword.isBlank())
			return assetRepo.findAllByCategoryAndStatusAndIsDeletedFalse(category, AssetStatus.AVAILABLE).stream()
					.map(this::toResponse).toList();
		return assetRepo.searchAvailableByKeywordAndCategory(keyword.trim(), category).stream().map(this::toResponse)
				.toList();
	}

	@Override
	public List<AssetResponse> getRentalAssetsExpiringSoon(int days) {
		return assetRepo.findRentalAssetsExpiringSoon(LocalDate.now().plusDays(days)).stream().map(a -> toResponse(a))
				.toList();
	}

	@Override
	public AssetResponse markRentalReturned(Long id, RentalReturnRequest request) {
		Asset a = assetRepo.findById(id).filter(x -> !x.getIsDeleted())
				.orElseThrow(() -> new AssetNotFoundException("Asset not found: " + id));
		if (a.getOwnershipType() != AssetOwnershipType.RENTAL) {
			throw new IllegalStateException("Asset is not a rental asset.");
		}
		if (a.getStatus() == AssetStatus.ASSIGNED) {
			throw new IllegalStateException("Release the mapping before returning to vendor.");
		}
		a.setRentalReturnedDate(request.getReturnedDate());
		a.setStatus(AssetStatus.RETURNED_TO_VENDOR);
		if (request.getRemarks() != null) {
			a.setNotes(request.getRemarks());
		}
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
		for (AssetCategory c : AssetCategory.values()) {
			byCat.put(c.name(), assetRepo.countByCategory(c));
		}
		s.setCountByCategory(byCat);
		return s;
	}

	@Override
	public BulkImportResult bulkImport(MultipartFile file, Long spId) {
		BulkImportResult result = new BulkImportResult();
		List<String> errors = new ArrayList<>();
		int total = 0, success = 0;

		try (InputStream is = file.getInputStream(); Workbook wb = new XSSFWorkbook(is)) {
			Sheet sheet = wb.getSheetAt(0);
			for (int i = 1; i <= sheet.getLastRowNum(); i++) {
				Row row = sheet.getRow(i);
				if (row == null) {
					continue;
				}
				total++;
				try {
					String nameVal = cellStr(row, 1);
					String catStr = cellStr(row, 2);
					String ownStr = cellStr(row, 7);
					if (nameVal == null) {
						errors.add("Row " + (i + 1) + ": name required");
						continue;
					}
					if (catStr == null) {
						errors.add("Row " + (i + 1) + ": category required");
						continue;
					}
					if (ownStr == null) {
						errors.add("Row " + (i + 1) + ": ownershipType required");
						continue;
					}

					AssetCategory category;
					AssetOwnershipType ownership;
					try {
						category = AssetCategory.valueOf(catStr.toUpperCase().replace(" ", "_"));
					} catch (Exception e) {
						errors.add("Row " + (i + 1) + ": invalid category '" + catStr + "'");
						continue;
					}
					try {
						ownership = AssetOwnershipType.valueOf(ownStr.toUpperCase());
					} catch (Exception e) {
						errors.add("Row " + (i + 1) + ": invalid ownershipType '" + ownStr + "'");
						continue;
					}

					String serial = cellStr(row, 5);
					if (serial != null && assetRepo.existsBySerialNumberAndIsDeletedFalse(serial)) {
						errors.add("Row " + (i + 1) + ": serial '" + serial + "' exists");
						continue;
					}
					if (ownership == AssetOwnershipType.RENTAL && cellStr(row, 13) == null) {
						errors.add("Row " + (i + 1) + ": vendorName required for rental");
						continue;
					}

					Asset asset = new Asset();
					asset.setName(nameVal);
					asset.setCategory(category);
					asset.setBrand(cellStr(row, 3));
					asset.setModel(cellStr(row, 4));
					asset.setSerialNumber(serial);
					asset.setLocation(cellStr(row, 6));
					asset.setOwnershipType(ownership);
					asset.setNotes(cellStr(row, 8));
					asset.setPurchaseDate(parseDate(cellStr(row, 9)));
					asset.setPurchaseCost(cellDbl(row, 10));
					asset.setWarrantyExpiryDate(parseDate(cellStr(row, 11)));
					asset.setDepreciationRatePercent(cellDbl(row, 12));
					asset.setRentalVendorName(cellStr(row, 13));
					asset.setRentalVendorContact(cellStr(row, 14));
					asset.setRentalContractNumber(cellStr(row, 15));
					asset.setRentalStartDate(parseDate(cellStr(row, 16)));
					asset.setRentalEndDate(parseDate(cellStr(row, 17)));
					asset.setRentalCostPerMonth(cellDbl(row, 18));
					asset.setRentalDepositAmount(cellDbl(row, 19));
					String renew = cellStr(row, 20);
					asset.setRentalRenewalOption(renew != null ? Boolean.parseBoolean(renew) : null);
					asset.setRentalReturnCondition(cellStr(row, 21));
					asset.setStatus(AssetStatus.AVAILABLE);
					asset.setAddedBySpId(spId);
					asset.setAssetTag("ASSET-TEMP-" + System.nanoTime());
					Asset saved = assetRepo.saveAndFlush(asset);
					saved.setAssetTag(String.format("ASSET-%06d", saved.getId()));
					assetRepo.save(saved);
					success++;
				} catch (Exception e) {
					errors.add("Row " + (i + 1) + ": " + e.getMessage());
				}
			}
		} catch (Exception ex) {
			throw new RuntimeException("Failed to parse Excel: " + ex.getMessage(), ex);
		}

		result.setTotalRows(total);
		result.setSuccessCount(success);
		result.setFailureCount(total - success);
		result.setErrors(errors);
		return result;
	}

	private String cellStr(Row row, int col) {
		Cell cell = row.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
		if (cell == null) {
			return null;
		}
		String value = DATA_FORMATTER.formatCellValue(cell);
		return value == null || value.isBlank() ? null : value.trim();
	}

	private Double cellDbl(Row row, int col) {
		Cell cell = row.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
		if (cell == null) {
			return null;
		}
		try {
			return cell.getNumericCellValue();
		} catch (Exception e) {
			try {
				return Double.parseDouble(DATA_FORMATTER.formatCellValue(cell));
			} catch (Exception ex) {
				return null;
			}
		}
	}

	private LocalDate parseDate(String val) {
		if (val == null) {
			return null;
		}
		try {
			return LocalDate.parse(val, DATE_FMT);
		} catch (Exception e) {
			return null;
		}
	}
}
