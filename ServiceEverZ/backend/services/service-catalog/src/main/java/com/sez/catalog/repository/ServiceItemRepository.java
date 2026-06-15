package com.sez.catalog.repository;

import com.sez.catalog.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceItemRepository extends JpaRepository<Service, Long> {
	List<Service> findByCategory_Id(Long categoryId);
	List<Service> findBySubcategory_Id(Long subcategoryId);
}
