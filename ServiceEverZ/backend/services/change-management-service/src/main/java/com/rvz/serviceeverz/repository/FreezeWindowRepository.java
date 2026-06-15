package com.rvz.serviceeverz.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rvz.serviceeverz.entity.FreezeWindow;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FreezeWindowRepository extends JpaRepository<FreezeWindow, Long> {
    @Query("SELECT f FROM FreezeWindow f WHERE f.freezeEnd >= :now ORDER BY f.freezeStart ASC")
    List<FreezeWindow> findActiveFreezeWindows(@Param("now") LocalDateTime now);
}
