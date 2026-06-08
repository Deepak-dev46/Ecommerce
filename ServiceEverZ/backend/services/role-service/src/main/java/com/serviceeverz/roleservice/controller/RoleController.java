package com.serviceeverz.roleservice.controller;
 
import com.serviceeverz.roleservice.role.dto.CreateRoleRequest;
import com.serviceeverz.roleservice.role.dto.RoleResponse;
import com.serviceeverz.roleservice.role.service.IRoleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
 
@RestController
@RequestMapping("/api/v1/admin/roles")
@PreAuthorize("hasAuthority('ADMIN')")
public class RoleController {
 
    private final IRoleService roleService;
 
    public RoleController(IRoleService roleService) {
        this.roleService = roleService;
    }
 
    // GET /api/v1/admin/roles  — list all roles
    @GetMapping
    public ResponseEntity<List<RoleResponse>> getAll() {
        return ResponseEntity.ok(roleService.getAllRoles());
    }
 
    // GET /api/v1/admin/roles/:id
    @GetMapping("/{id}")
    public ResponseEntity<RoleResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(roleService.getRoleById(id));
    }
 
    // POST /api/v1/admin/roles  — create a new role
    @PostMapping
    public ResponseEntity<RoleResponse> create(@Valid @RequestBody CreateRoleRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roleService.createRole(req));
    }
 
    // PUT /api/v1/admin/roles/:id  — update name/description
    @PutMapping("/{id}")
    public ResponseEntity<RoleResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateRoleRequest req) {
        return ResponseEntity.ok(roleService.updateRole(id, req));
    }
 
    // // DELETE /api/v1/admin/roles/:id  — soft deactivate
    // @DeleteMapping("/{id}")
    // public ResponseEntity<Void> deactivate(@PathVariable Long id) {
    //     roleService.deactivateRole(id);
    //     return ResponseEntity.noContent().build();
    // }


    @DeleteMapping("/{id}")
public ResponseEntity<Void> delete(@PathVariable Long id) {
    roleService.deleteRole(id);
    return ResponseEntity.noContent().build();
}
}
 