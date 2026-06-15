package com.serviceeverz.roleservice.permission.controller;

import com.serviceeverz.roleservice.permission.dto.BulkPermissionRequest;
import com.serviceeverz.roleservice.permission.dto.RolePermissionRequest;
import com.serviceeverz.roleservice.permission.dto.RolePermissionResponse;
import com.serviceeverz.roleservice.permission.service.IRolePermissionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/role-permissions")
@PreAuthorize("hasAuthority('ADMIN')")
public class RolePermissionController {
	private final IRolePermissionService service;

	public RolePermissionController(IRolePermissionService service) {
		this.service = service;
	}

	@PostMapping
	public ResponseEntity<RolePermissionResponse> save(@Valid @RequestBody RolePermissionRequest req) {
		return ResponseEntity.ok(service.savePermission(req));
	}

	@PostMapping("/bulk")
	public ResponseEntity<List<RolePermissionResponse>> saveBulk(@Valid @RequestBody BulkPermissionRequest req) {
		return ResponseEntity.ok(service.savePermissionsBulk(req));
	}

	@GetMapping("/{roleId}")
	public ResponseEntity<List<RolePermissionResponse>> get(@PathVariable Long roleId) {
		return ResponseEntity.ok(service.getPermissionsForRole(roleId));
	}
}
