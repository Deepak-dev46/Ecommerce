package com.sez.catalog.repository;

import com.sez.catalog.entity.Subcategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface SubcategoryRepository extends JpaRepository<Subcategory, Long> {

    List<Subcategory> findByCategory_Id(Long categoryId);

    boolean existsByNameAndCategory_Id(String name, Long categoryId);
}