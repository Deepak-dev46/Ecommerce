    package com.rvz.serviceeverz.exceptions;


    import java.util.HashMap;
    import java.util.Map;

    import org.slf4j.Logger;
    import org.slf4j.LoggerFactory;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;
    import org.springframework.validation.FieldError;
    import org.springframework.web.bind.MethodArgumentNotValidException;
    import org.springframework.web.bind.annotation.ExceptionHandler;
    import org.springframework.web.bind.annotation.RestControllerAdvice;

    import com.rvz.serviceeverz.dto.response.ApiResponse;
    
    @RestControllerAdvice
    public class GlobalExceptionHandler {
    
        private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiResponse<Map<String, String>>> handleValidation(MethodArgumentNotValidException ex) {
            Map<String, String> errors = new HashMap<>();
            ex.getBindingResult().getAllErrors().forEach(err ->
                    errors.put(((FieldError) err).getField(), err.getDefaultMessage()));
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Validation failed", errors));
        }
    
        @ExceptionHandler(AssetNotFoundException.class)
        public ResponseEntity<ApiResponse<String>> handleNotFound(AssetNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>(false, ex.getMessage(), null));
        }
    
        @ExceptionHandler(AssetNotAvailableException.class)
        public ResponseEntity<ApiResponse<String>> handleNotAvailable(AssetNotAvailableException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiResponse<>(false, ex.getMessage(), null));
        }
    
        @ExceptionHandler(IllegalStateException.class)
        public ResponseEntity<ApiResponse<String>> handleIllegalState(IllegalStateException ex) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, ex.getMessage(), null));
        }
    
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiResponse<String>> handleGeneral(Exception ex) {
            log.error("Unexpected error: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "An unexpected error occurred", null));
        }
    }
    