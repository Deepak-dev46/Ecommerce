package com.fastcart.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fastcart.modal.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

}
