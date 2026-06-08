package com.rvz.serviceeverz.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rvz.serviceeverz.entity.ChangePlan;
import com.rvz.serviceeverz.enums.ChangeStatus;

import java.util.List;

@Repository
public interface ChangePlanRepository extends JpaRepository<ChangePlan, Long> {
    List<ChangePlan> findAllByCreatedBySpId(Long spId);
    List<ChangePlan> findAllByStatus(ChangeStatus status);
}
