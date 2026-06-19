package com.fastcart.service;

import java.util.List;

import com.fastcart.modal.Product;
import com.fastcart.response.ApiResponse;

public interface ProductService {
	ApiResponse<List<Product>> getAllProducts();

}
