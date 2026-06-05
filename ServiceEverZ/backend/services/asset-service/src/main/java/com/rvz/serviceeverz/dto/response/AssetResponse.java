package com.rvz.serviceeverz.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.rvz.serviceeverz.enums.AssetCategory;
import com.rvz.serviceeverz.enums.AssetOwnershipType;
import com.rvz.serviceeverz.enums.AssetStatus;

public class AssetResponse {
	private Long id;
	private String assetTag, name, brand, model, serialNumber, location, notes;
	private AssetCategory category;
	private AssetStatus status;
	private AssetOwnershipType ownershipType;
	private Long assignedToUserId, addedBySpId;
	private String assignedToUserName, addedBySpName;
	private LocalDateTime createdAt, updatedAt;
	private LocalDate purchaseDate, warrantyExpiryDate;
	private Double purchaseCost, depreciationRatePercent;
	private String rentalVendorName, rentalVendorContact, rentalVendorEmail, rentalContractNumber,
			rentalReturnCondition;
	private LocalDate rentalStartDate, rentalEndDate, rentalReturnedDate;
	private Double rentalCostPerMonth, rentalDepositAmount;
	private Boolean rentalRenewalOption, rentalExpiringSoon;
	/** True when a PDF/image invoice is stored for this asset. */
	private boolean hasInvoice;
	/** MIME type of the stored invoice, e.g. "application/pdf". */
	private String invoiceContentType;
	/** Original file name for display. */
	private String invoiceFileName;

	// ── NEW: Category-specific specifications ─────────────────────
	private List<AssetSpecificationResponse> specifications = new ArrayList<>();

	public String getRentalVendorEmail() {
		return rentalVendorEmail;
	}

	public void setRentalVendorEmail(String v) {
		rentalVendorEmail = v;
	}

	public boolean isHasInvoice() {
		return hasInvoice;
	}

	public void setHasInvoice(boolean hasInvoice) {
		this.hasInvoice = hasInvoice;
	}

	public String getInvoiceContentType() {
		return invoiceContentType;
	}

	public void setInvoiceContentType(String invoiceContentType) {
		this.invoiceContentType = invoiceContentType;
	}

	public String getInvoiceFileName() {
		return invoiceFileName;
	}

	public void setInvoiceFileName(String invoiceFileName) {
		this.invoiceFileName = invoiceFileName;
	}

	public List<AssetSpecificationResponse> getSpecifications() {
		return specifications;
	}

	public void setSpecifications(List<AssetSpecificationResponse> specifications) {
		this.specifications = specifications;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long v) {
		id = v;
	}

	public String getAssetTag() {
		return assetTag;
	}

	public void setAssetTag(String v) {
		assetTag = v;
	}

	public String getName() {
		return name;
	}

	public void setName(String v) {
		name = v;
	}

	public String getBrand() {
		return brand;
	}

	public void setBrand(String v) {
		brand = v;
	}

	public String getModel() {
		return model;
	}

	public void setModel(String v) {
		model = v;
	}

	public String getSerialNumber() {
		return serialNumber;
	}

	public void setSerialNumber(String v) {
		serialNumber = v;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String v) {
		location = v;
	}

	public String getNotes() {
		return notes;
	}

	public void setNotes(String v) {
		notes = v;
	}

	public AssetCategory getCategory() {
		return category;
	}

	public void setCategory(AssetCategory v) {
		category = v;
	}

	public AssetStatus getStatus() {
		return status;
	}

	public void setStatus(AssetStatus v) {
		status = v;
	}

	public AssetOwnershipType getOwnershipType() {
		return ownershipType;
	}

	public void setOwnershipType(AssetOwnershipType v) {
		ownershipType = v;
	}

	public Long getAssignedToUserId() {
		return assignedToUserId;
	}

	public void setAssignedToUserId(Long v) {
		assignedToUserId = v;
	}

	public String getAssignedToUserName() {
		return assignedToUserName;
	}

	public void setAssignedToUserName(String v) {
		assignedToUserName = v;
	}

	public Long getAddedBySpId() {
		return addedBySpId;
	}

	public void setAddedBySpId(Long v) {
		addedBySpId = v;
	}

	public String getAddedBySpName() {
		return addedBySpName;
	}

	public void setAddedBySpName(String v) {
		addedBySpName = v;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime v) {
		createdAt = v;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime v) {
		updatedAt = v;
	}

	public LocalDate getPurchaseDate() {
		return purchaseDate;
	}

	public void setPurchaseDate(LocalDate v) {
		purchaseDate = v;
	}

	public LocalDate getWarrantyExpiryDate() {
		return warrantyExpiryDate;
	}

	public void setWarrantyExpiryDate(LocalDate v) {
		warrantyExpiryDate = v;
	}

	public Double getPurchaseCost() {
		return purchaseCost;
	}

	public void setPurchaseCost(Double v) {
		purchaseCost = v;
	}

	public Double getDepreciationRatePercent() {
		return depreciationRatePercent;
	}

	public void setDepreciationRatePercent(Double v) {
		depreciationRatePercent = v;
	}

	public String getRentalVendorName() {
		return rentalVendorName;
	}

	public void setRentalVendorName(String v) {
		rentalVendorName = v;
	}

	public String getRentalVendorContact() {
		return rentalVendorContact;
	}

	public void setRentalVendorContact(String v) {
		rentalVendorContact = v;
	}

	public String getRentalContractNumber() {
		return rentalContractNumber;
	}

	public void setRentalContractNumber(String v) {
		rentalContractNumber = v;
	}

	public String getRentalReturnCondition() {
		return rentalReturnCondition;
	}

	public void setRentalReturnCondition(String v) {
		rentalReturnCondition = v;
	}

	public LocalDate getRentalStartDate() {
		return rentalStartDate;
	}

	public void setRentalStartDate(LocalDate v) {
		rentalStartDate = v;
	}

	public LocalDate getRentalEndDate() {
		return rentalEndDate;
	}

	public void setRentalEndDate(LocalDate v) {
		rentalEndDate = v;
	}

	public LocalDate getRentalReturnedDate() {
		return rentalReturnedDate;
	}

	public void setRentalReturnedDate(LocalDate v) {
		rentalReturnedDate = v;
	}

	public Double getRentalCostPerMonth() {
		return rentalCostPerMonth;
	}

	public void setRentalCostPerMonth(Double v) {
		rentalCostPerMonth = v;
	}

	public Double getRentalDepositAmount() {
		return rentalDepositAmount;
	}

	public void setRentalDepositAmount(Double v) {
		rentalDepositAmount = v;
	}

	public Boolean getRentalRenewalOption() {
		return rentalRenewalOption;
	}

	public void setRentalRenewalOption(Boolean v) {
		rentalRenewalOption = v;
	}

	public Boolean getRentalExpiringSoon() {
		return rentalExpiringSoon;
	}

	public void setRentalExpiringSoon(Boolean v) {
		rentalExpiringSoon = v;
	}
}
