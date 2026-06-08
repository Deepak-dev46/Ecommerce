package com.rvz.serviceeverz.repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rvz.serviceeverz.entity.Asset;
import com.rvz.serviceeverz.enums.AssetCategory;
import com.rvz.serviceeverz.enums.AssetOwnershipType;
import com.rvz.serviceeverz.enums.AssetStatus;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
	Optional<Asset> findByAssetTagAndIsDeletedFalse(String assetTag);

	Optional<Asset> findBySerialNumberAndIsDeletedFalse(String serialNumber);

	List<Asset> findAllByIsDeletedFalseOrderByCreatedAtDesc();

	List<Asset> findAllByStatusAndIsDeletedFalse(AssetStatus status);

	List<Asset> findAllByCategoryAndIsDeletedFalse(AssetCategory category);

	List<Asset> findAllByOwnershipTypeAndIsDeletedFalse(AssetOwnershipType ownershipType);

	List<Asset> findAllByAssignedToUserIdAndIsDeletedFalse(Long userId);

	boolean existsByAssetTagAndIsDeletedFalse(String assetTag);

	boolean existsBySerialNumberAndIsDeletedFalse(String serialNumber);

	@Query("SELECT COUNT(a) FROM Asset a WHERE a.status = :status AND a.isDeleted = false")
	long countByStatus(@Param("status") AssetStatus status);

	@Query("SELECT COUNT(a) FROM Asset a WHERE a.category = :category AND a.isDeleted = false")
	long countByCategory(@Param("category") AssetCategory category);

	@Query("SELECT COUNT(a) FROM Asset a WHERE a.ownershipType = :ownershipType AND a.isDeleted = false")
	long countByOwnershipType(@Param("ownershipType") AssetOwnershipType ownershipType);

	@Query("SELECT a FROM Asset a WHERE a.ownershipType = 'RENTAL' AND a.isDeleted = false "
			+ "AND a.rentalEndDate <= :cutoff AND a.rentalReturnedDate IS NULL")
	List<Asset> findRentalAssetsExpiringSoon(@Param("cutoff") LocalDate cutoff);

	@Query("SELECT a FROM Asset a WHERE a.isDeleted = false AND (" + "LOWER(a.name) LIKE LOWER(CONCAT('%',:kw,'%')) OR "
			+ "LOWER(a.assetTag) LIKE LOWER(CONCAT('%',:kw,'%')) OR "
			+ "LOWER(a.brand) LIKE LOWER(CONCAT('%',:kw,'%')) OR "
			+ "LOWER(a.rentalVendorName) LIKE LOWER(CONCAT('%',:kw,'%')))")
	List<Asset> searchByKeyword(@Param("kw") String kw);

	@Query("SELECT a FROM Asset a WHERE a.isDeleted = false "
			+ "AND a.status = com.rvz.serviceeverz.enums.AssetStatus.AVAILABLE AND ("
			+ "LOWER(a.name) LIKE LOWER(CONCAT('%',:kw,'%')) OR "
			+ "LOWER(a.assetTag) LIKE LOWER(CONCAT('%',:kw,'%')) OR "
			+ "LOWER(a.brand) LIKE LOWER(CONCAT('%',:kw,'%')) OR "
			+ "LOWER(a.model) LIKE LOWER(CONCAT('%',:kw,'%')) OR "
			+ "LOWER(a.serialNumber) LIKE LOWER(CONCAT('%',:kw,'%')))")
	List<Asset> searchAvailableByKeyword(@Param("kw") String kw);

	@Query("SELECT a FROM Asset a WHERE a.isDeleted = false "
			+ "AND a.status = com.rvz.serviceeverz.enums.AssetStatus.AVAILABLE " + "AND a.category = :category AND ("
			+ "LOWER(a.name) LIKE LOWER(CONCAT('%',:kw,'%')) OR "
			+ "LOWER(a.assetTag) LIKE LOWER(CONCAT('%',:kw,'%')) OR "
			+ "LOWER(a.brand) LIKE LOWER(CONCAT('%',:kw,'%')) OR "
			+ "LOWER(a.model) LIKE LOWER(CONCAT('%',:kw,'%')) OR "
			+ "LOWER(a.serialNumber) LIKE LOWER(CONCAT('%',:kw,'%')))")
	List<Asset> searchAvailableByKeywordAndCategory(@Param("kw") String kw, @Param("category") AssetCategory category);

	List<Asset> findAllByCategoryAndStatusAndIsDeletedFalse(AssetCategory category, AssetStatus status);
	 @Query("""
		        SELECT a FROM Asset a
		        WHERE a.isDeleted = false
		          AND a.status = 'AVAILABLE'
		          AND a.id IN :assetIds
		          AND (:keyword IS NULL OR
		               LOWER(a.name)         LIKE LOWER(CONCAT('%',:keyword,'%')) OR
		               LOWER(a.brand)        LIKE LOWER(CONCAT('%',:keyword,'%')) OR
		               LOWER(a.model)        LIKE LOWER(CONCAT('%',:keyword,'%')) OR
		               LOWER(a.assetTag)     LIKE LOWER(CONCAT('%',:keyword,'%')) OR
		               LOWER(a.serialNumber) LIKE LOWER(CONCAT('%',:keyword,'%')))
		          AND (:category IS NULL OR a.category = :category)
		        ORDER BY a.createdAt DESC
		        """)
		    List<Asset> searchAvailableBySpecIds(
		        @Param("assetIds")  Collection<Long> assetIds,
		        @Param("keyword")   String keyword,
		        @Param("category")  AssetCategory category);
}
