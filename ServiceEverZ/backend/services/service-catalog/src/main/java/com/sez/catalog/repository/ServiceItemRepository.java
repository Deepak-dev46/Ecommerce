package com.sez.catalog.repository;

import com.sez.catalog.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceItemRepository extends JpaRepository<Service, Long> {
    List<Service> findByCategory_Id(Long categoryId);
    List<Service> findBySubcategory_Id(Long subcategoryId);

    // End-user browsing: only active items
    List<Service> findBySubcategory_IdAndActiveTrue(Long subcategoryId);
    List<Service> findByCategory_IdAndActiveTrue(Long categoryId);
    List<Service> findByActiveTrue();
}
