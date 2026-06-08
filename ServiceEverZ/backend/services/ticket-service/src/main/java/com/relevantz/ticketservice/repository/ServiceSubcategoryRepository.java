package com.relevantz.ticketservice.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.relevantz.ticketservice.model.ServiceSubcategory;

public interface ServiceSubcategoryRepository extends JpaRepository<ServiceSubcategory, Long> {}