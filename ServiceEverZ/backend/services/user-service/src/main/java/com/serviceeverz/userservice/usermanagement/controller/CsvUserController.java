package com.serviceeverz.userservice.usermanagement.controller;
 
import com.serviceeverz.userservice.usermanagement.dto.CsvUploadResponse;
import com.serviceeverz.userservice.usermanagement.service.IUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
 
@RestController
@RequestMapping("/api/v1/admin/users")
public class CsvUserController {
 
    private final IUserService service;
 
    public CsvUserController(IUserService service) {
        this.service = service;
    }
 
    @PostMapping("/upload-csv")
    public ResponseEntity<CsvUploadResponse> uploadCsv(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "X-User-Id", required = false) Long adminId,
            @RequestHeader(value = "X-User-Email", required = false) String adminEmail) {
 
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Please upload a CSV file");
        }
 
        String originalName = file.getOriginalFilename();
        if (originalName == null || !originalName.toLowerCase().endsWith(".csv")) {
            throw new RuntimeException("Only CSV files are allowed");
        }
 
        return ResponseEntity.ok(
                service.createUsersFromCsv(file, adminId == null ? 0L : adminId, adminEmail)
        );
    }
}
 