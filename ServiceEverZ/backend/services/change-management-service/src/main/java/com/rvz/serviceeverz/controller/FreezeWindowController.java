package com.rvz.serviceeverz.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.rvz.serviceeverz.dto.request.FreezeWindowRequest;
import com.rvz.serviceeverz.dto.response.ApiResponse;
import com.rvz.serviceeverz.dto.response.FreezeWindowResponse;
import com.rvz.serviceeverz.service.FreezeWindowService;

import java.util.List;

@RestController
@RequestMapping("/api/change-management/freeze-windows")
@CrossOrigin(origins="*")
public class FreezeWindowController {

    private final FreezeWindowService freezeWindowService;

    public FreezeWindowController(FreezeWindowService freezeWindowService) {
        this.freezeWindowService = freezeWindowService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FreezeWindowResponse>> create(@Valid @RequestBody FreezeWindowRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Freeze window created and all users notified", freezeWindowService.createFreezeWindow(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FreezeWindowResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", freezeWindowService.getAllFreezeWindows()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<FreezeWindowResponse>>> getActive() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", freezeWindowService.getActiveFreezeWindows()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        freezeWindowService.deleteFreezeWindow(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Freeze window deleted", null));
    }
}
