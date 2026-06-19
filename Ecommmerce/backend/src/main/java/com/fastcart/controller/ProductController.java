package com.fastcart.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fastcart.modal.Product;
import com.fastcart.response.ApiResponse;
import com.fastcart.service.ProductService;


@RestController
@RequestMapping("api/v1/products")
@CrossOrigin
public class ProductController {
	
	@Autowired
	private ProductService productService;
	
	@GetMapping
	public ResponseEntity<ApiResponse<List<Product>>> getAllProducts() {
		return ResponseEntity.ok(productService.getAllProducts());
	}
	
}
