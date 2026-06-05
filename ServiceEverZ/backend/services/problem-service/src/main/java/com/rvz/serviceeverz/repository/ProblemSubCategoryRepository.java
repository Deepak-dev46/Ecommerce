package com.rvz.serviceeverz.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rvz.serviceeverz.entity.ProblemSubCategory;
 
public interface ProblemSubCategoryRepository extends JpaRepository<ProblemSubCategory, Long> {
    List<ProblemSubCategory> findAllByCategoryIdAndIsActiveTrue(Long categoryId);
    boolean existsByNameIgnoreCaseAndCategoryId(String name, Long categoryId);
}
 