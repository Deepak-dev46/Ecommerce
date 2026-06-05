package com.rvz.masterdataservice.repository;

import com.rvz.masterdataservice.entity.ServiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceItemRepository extends JpaRepository<ServiceItem, Integer> {
    List<ServiceItem> findByServiceSubcategory_SubcategoryId(Integer subcategoryId);
    List<ServiceItem> findByStatus(String status);
}
