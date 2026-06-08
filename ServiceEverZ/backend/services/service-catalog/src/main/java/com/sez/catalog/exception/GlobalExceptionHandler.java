package com.sez.catalog.exception;

import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.sez.catalog.dto.ApiError;
import com.sez.catalog.dto.CatalogDtos;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(RuntimeException.class)
	public ResponseEntity<CatalogDtos.ErrorResponse> handleRuntime(RuntimeException e) {
		return ResponseEntity.badRequest().body(new CatalogDtos.ErrorResponse(400, e.getMessage()));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<CatalogDtos.ErrorResponse> handleGeneral(Exception e) {
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new CatalogDtos.ErrorResponse(500, "Internal server error"));
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<ApiError> handleDataIntegrityViolation(DataIntegrityViolationException ex) {

		ApiError error = new ApiError("DELETE_NOT_ALLOWED",
				"Cannot delete this item because it contains dependent categories, subcategories, or services. Please delete them first.");

		return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
	}
	

    @ExceptionHandler(DeleteNotAllowedException.class)
    public ResponseEntity<?> handleDeleteNotAllowed(DeleteNotAllowedException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
            Map.of(
                "code", "DELETE_NOT_ALLOWED",
                "message", ex.getMessage()
            )
        );
    }


}
