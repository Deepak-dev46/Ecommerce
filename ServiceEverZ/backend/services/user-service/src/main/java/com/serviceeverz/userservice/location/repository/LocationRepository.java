
package com.serviceeverz.userservice.location.repository;

import com.serviceeverz.userservice.location.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {

    boolean existsByNameIgnoreCase(String name);

    Optional<Location> findByNameIgnoreCase(String name);

    // NEW: for search filtering in getAll()
    List<Location> findByNameContainingIgnoreCase(String name);
}