package com.rvz.serviceeverz.dto.request;

import java.time.LocalDate;

import com.rvz.serviceeverz.enums.AssetCategory;
import com.rvz.serviceeverz.enums.AssetOwnershipType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AssetRequest {

	@NotBlank(message = "Asset name is required")
	private String name;
	@NotNull(message = "Category is required")
	private AssetCategory category;
	private String brand, model, serialNumber, location, notes;
	@NotNull(message = "SP ID is required")
	private Long addedBySpId;
	@NotNull(message = "Ownership type is required")
	private AssetOwnershipType ownershipType;

	// OWNED
	private LocalDate purchaseDate;
	private Double purchaseCost;
	private LocalDate warrantyExpiryDate;
	private Double depreciationRatePercent;

	// RENTAL
	private String rentalVendorName, rentalVendorContact, rentalContractNumber, rentalReturnCondition;
	private LocalDate rentalStartDate, rentalEndDate;
	private Double rentalCostPerMonth, rentalDepositAmount;
	private Boolean rentalRenewalOption;

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
}
