package com.sez.catalog.repository;

import com.sez.catalog.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByServiceType_Id(Long serviceTypeId);
    boolean existsByServiceType_Id(Long serviceTypeId);
    boolean existsByNameAndServiceType_Id(String name, Long serviceTypeId);
}