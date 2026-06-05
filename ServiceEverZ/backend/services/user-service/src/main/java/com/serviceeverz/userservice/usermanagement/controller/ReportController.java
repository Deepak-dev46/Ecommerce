package com.serviceeverz.userservice.usermanagement.controller;
 
import com.serviceeverz.userservice.usermanagement.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
 
import java.util.HashMap;
import java.util.List;
import java.util.Map;
 
@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {
 
    @Autowired
    private ReportService reportService;
 
    @GetMapping("/users")
    public ResponseEntity<byte[]> downloadUsersReport(
            @RequestParam(defaultValue = "excel") String format) throws Exception {
        String normalizedFormat = format.toLowerCase().trim();
        byte[] data = reportService.generateUsersReport(normalizedFormat);
        return buildResponse(data, "users_report", normalizedFormat);
    }
 
    @GetMapping("/roles")
    public ResponseEntity<byte[]> downloadRolesReport(
            @RequestParam(defaultValue = "excel") String format,
            @RequestParam(required = false) String sheet) throws Exception {
        String normalizedFormat = format.toLowerCase().trim();
        byte[] data = reportService.generateRolesReport(normalizedFormat, sheet);
        return buildResponse(data, "roles_report", normalizedFormat);
    }
 
    @GetMapping("/user-activity")
    public ResponseEntity<byte[]> downloadActivityReport(
            @RequestParam(defaultValue = "excel") String format) throws Exception {
        String normalizedFormat = format.toLowerCase().trim();
        byte[] data = reportService.generateActivityReport(normalizedFormat);
        return buildResponse(data, "activity_report", normalizedFormat);
    }
 
    @GetMapping("/debug")
    public ResponseEntity<?> debug() {
        List<Object[]> roleUsers = reportService.debugRoleUsers();
        List<Object[]> roleCounts = reportService.debugRoleCounts();
 
        Map<String, Object> result = new HashMap<>();
        result.put("roleUserCount", roleUsers.size());
        result.put("roleCountSize", roleCounts.size());
        result.put("firstRoleUser", roleUsers.isEmpty() ? "EMPTY" : roleUsers.get(0));
        result.put("firstRoleCount", roleCounts.isEmpty() ? "EMPTY" : roleCounts.get(0));
 
        return ResponseEntity.ok(result);
    }
 
    private ResponseEntity<byte[]> buildResponse(byte[] data, String name, String format) {
        boolean isCsv = format.equals("csv");
        String filename = name + (isCsv ? ".csv" : ".xlsx");
 
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(
            ContentDisposition.attachment().filename(filename).build()
        );
        headers.setContentType(isCsv
            ? MediaType.parseMediaType("text/csv; charset=UTF-8")
            : MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        );
        headers.setContentLength(data.length);
        headers.add("Access-Control-Expose-Headers", "Content-Disposition");
 
        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }
}
 
 