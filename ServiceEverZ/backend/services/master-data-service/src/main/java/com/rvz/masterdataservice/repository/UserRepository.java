package com.rvz.masterdataservice.repository;

import com.rvz.masterdataservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    /** Find all active users (status = ACTIVE) */
    java.util.List<User> findByStatus(User.Status status);
}
