package com.rvz.serviceeverz.repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rvz.serviceeverz.entity.RetentionPolicy;

@Repository
public interface RetentionPolicyRepository extends JpaRepository<RetentionPolicy, Long> {

    List<RetentionPolicy> findAllByIsActiveTrue();

    Optional<RetentionPolicy> findByPolicyNameIgnoreCase(String policyName);

    boolean existsByPolicyNameIgnoreCase(String policyName);

    List<RetentionPolicy> findAllByCreatedByManagerId(Long managerId);
}
