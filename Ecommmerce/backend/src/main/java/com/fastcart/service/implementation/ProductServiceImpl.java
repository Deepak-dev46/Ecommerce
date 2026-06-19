package com.fastcart.service.implementation;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fastcart.modal.Product;
import com.fastcart.repository.ProductRepository;
import com.fastcart.response.ApiResponse;
import com.fastcart.service.ProductService;

@Service
public class ProductServiceImpl implements ProductService {

	@Autowired
	private ProductRepository productRepository;
	
	@Override
	public ApiResponse<List<Product>> getAllProducts() {
		List<Product> products= productRepository.findAll();
		return new ApiResponse<List<Product>>(products); 
	}
}
