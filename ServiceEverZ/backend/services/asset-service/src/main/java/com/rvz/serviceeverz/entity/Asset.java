package com.rvz.serviceeverz.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.rvz.serviceeverz.enums.AssetCategory;
import com.rvz.serviceeverz.enums.AssetOwnershipType;
import com.rvz.serviceeverz.enums.AssetStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "assets")
public class Asset {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "asset_tag", unique = true, nullable = false, length = 60)
	private String assetTag;

	@Column(nullable = false, length = 120)
	private String name;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private AssetCategory category;

	@Column(length = 60)
	private String brand;
	@Column(length = 80)
	private String model;
	@Column(name = "serial_number", unique = true, length = 100)
	private String serialNumber;
	@Column(length = 80)
	private String location;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private AssetStatus status = AssetStatus.AVAILABLE;

	@Column(name = "assigned_to_user_id")
	private Long assignedToUserId;
	@Column(columnDefinition = "TEXT")
	private String notes;
	@Column(name = "added_by_sp_id")
	private Long addedBySpId;

	@Enumerated(EnumType.STRING)
	@Column(name = "ownership_type", nullable = false, length = 20)
	private AssetOwnershipType ownershipType = AssetOwnershipType.OWNED;

	// ── OWNED ──────────────────────────────────────────────────────
	@Column(name = "purchase_date")
	private LocalDate purchaseDate;
	@Column(name = "purchase_cost")
	private Double purchaseCost;
	@Column(name = "warranty_expiry_date")
	private LocalDate warrantyExpiryDate;
	@Column(name = "depreciation_rate_percent")
	private Double depreciationRatePercent;

	// ── RENTAL ─────────────────────────────────────────────────────
	@Column(name = "rental_vendor_name", length = 150)
	private String rentalVendorName;
	@Column(name = "rental_vendor_contact", length = 120)
	private String rentalVendorContact;
	@Column(name = "rental_vendor_email", length = 150)
	private String rentalVendorEmail;
	@Column(name = "rental_contract_number", length = 80)
	private String rentalContractNumber;
	@Column(name = "rental_start_date")
	private LocalDate rentalStartDate;
	@Column(name = "rental_end_date")
	private LocalDate rentalEndDate;
	@Column(name = "rental_cost_per_month")
	private Double rentalCostPerMonth;
	@Column(name = "rental_deposit_amount")
	private Double rentalDepositAmount;

	public String getRentalVendorEmail() {
		return rentalVendorEmail;
	}

	public void setRentalVendorEmail(String v) {
		rentalVendorEmail = v;
	}

	public String getInvoiceData() {
		return invoiceData;
	}

	public void setInvoiceData(String invoiceData) {
		this.invoiceData = invoiceData;
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

	public List<AssetSpecification> getSpecifications() {
		return specifications;
	}

	public void setSpecifications(List<AssetSpecification> specifications) {
		this.specifications = specifications;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	@Column(name = "rental_renewal_option")
	private Boolean rentalRenewalOption;
	@Column(name = "rental_return_condition", columnDefinition = "TEXT")
	private String rentalReturnCondition;
	@Column(name = "rental_returned_date")
	private LocalDate rentalReturnedDate;

	// ── AUDIT ───────────────────────────────────────────────────────
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;
	@Column(name = "updated_at")
	private LocalDateTime updatedAt;
	@Column(name = "is_deleted")
	private Boolean isDeleted = false;
	/**
	 * Base64-encoded bytes of the uploaded invoice PDF/image.
	 * Stored as LONGTEXT so the column can hold files up to ~10 MB after encoding.
	 * The frontend sends this in the JSON body; the backend streams it back
	 * via GET /api/assets/{id}/invoice without writing anything to disk.
	 */
	@Column(name = "invoice_data", columnDefinition = "LONGTEXT")
	private String invoiceData;

	/** MIME type of the invoice file, e.g. "application/pdf", "image/jpeg". */
	@Column(name = "invoice_content_type", length = 100)
	private String invoiceContentType;

	/** Original file name shown in the UI, e.g. "purchase-invoice.pdf". */
	@Column(name = "invoice_file_name", length = 500)
	private String invoiceFileName;

	// ── Category-specific specifications (OneToMany) ─────────────
	@OneToMany(mappedBy = "asset", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<AssetSpecification> specifications = new ArrayList<>();

	@PrePersist
	public void prePersist() {
		createdAt = LocalDateTime.now();
		updatedAt = LocalDateTime.now();
	}

	@PreUpdate
	public void preUpdate() {
		updatedAt = LocalDateTime.now();
	}

	public Long getId() {
		return id;
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

	public AssetCategory getCategory() {
		return category;
	}

	public void setCategory(AssetCategory v) {
		category = v;
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

	public AssetStatus getStatus() {
		return status;
	}

	public void setStatus(AssetStatus v) {
		status = v;
	}

	public Long getAssignedToUserId() {
		return assignedToUserId;
	}

	public void setAssignedToUserId(Long v) {
		assignedToUserId = v;
	}

	public String getNotes() {
		return notes;
	}

	public void setNotes(String v) {
		notes = v;
	}

	public Long getAddedBySpId() {
		return addedBySpId;
	}

	public void setAddedBySpId(Long v) {
		addedBySpId = v;
	}

	public AssetOwnershipType getOwnershipType() {
		return ownershipType;
	}

	public void setOwnershipType(AssetOwnershipType v) {
		ownershipType = v;
	}

	public LocalDate getPurchaseDate() {
		return purchaseDate;
	}

	public void setPurchaseDate(LocalDate v) {
		purchaseDate = v;
	}

	public Double getPurchaseCost() {
		return purchaseCost;
	}

	public void setPurchaseCost(Double v) {
		purchaseCost = v;
	}

	public LocalDate getWarrantyExpiryDate() {
		return warrantyExpiryDate;
	}

	public void setWarrantyExpiryDate(LocalDate v) {
		warrantyExpiryDate = v;
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

	public String getRentalReturnCondition() {
		return rentalReturnCondition;
	}

	public void setRentalReturnCondition(String v) {
		rentalReturnCondition = v;
	}

	public LocalDate getRentalReturnedDate() {
		return rentalReturnedDate;
	}

	public void setRentalReturnedDate(LocalDate v) {
		rentalReturnedDate = v;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public Boolean getIsDeleted() {
		return isDeleted;
	}

	public void setIsDeleted(Boolean v) {
		isDeleted = v;
	}
}
