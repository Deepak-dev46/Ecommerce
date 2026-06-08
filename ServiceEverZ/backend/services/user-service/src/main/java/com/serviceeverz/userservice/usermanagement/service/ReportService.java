package com.serviceeverz.userservice.usermanagement.service;
 
import com.serviceeverz.userservice.usermanagement.entity.User;
import com.serviceeverz.userservice.usermanagement.repository.UserRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
 
import java.io.*;
import java.util.*;
 
@Service
public class ReportService {
 
    @Autowired
    private UserRepository userRepository;
 
    @Autowired
    private RestTemplate restTemplate;
 
    // ── Users Report ──────────────────────────────────────────────────────────
    // ── Users Report ──────────────────────────────────────────────────────────
public byte[] generateUsersReport(String format) throws Exception {  // ✅ rename param to "format"
    List<User> users = userRepository.findAll();
 
    String[] headers = {
        "ID", "Employee ID", "Full Name", "Email",
        "Department", "Designation", "Location", "Status", "Created At"
    };
 
    if (format.equals("csv")) {  // ✅ now "format" exists
        StringBuilder sb = new StringBuilder();
        sb.append(String.join(",", headers)).append("\n");
        for (User u : users) {
            sb.append(String.join(",",
                csvEscape(str(u.getId())),
                csvEscape(str(u.getEmployeeId())),
                csvEscape(str(u.getFirstName() + " " + u.getLastName())),
                csvEscape(str(u.getEmail())),
                csvEscape(str(u.getDepartment() != null ? u.getDepartment().getName() : "")),
                csvEscape(str(u.getDesignation() != null ? u.getDesignation().getName() : "")),
                csvEscape(str(u.getLocation() != null ? u.getLocation().getName() : "")),
                csvEscape(str(u.getStatus())),
                csvEscape(str(u.getCreatedAt()))
            )).append("\n");
        }
        return sb.toString().getBytes("UTF-8");
    }
 
    // Excel
    Workbook workbook = new XSSFWorkbook();
    Sheet sheet = workbook.createSheet("Users");
    createHeaderRow(workbook, sheet, headers);
    int rowNum = 1;
    for (User u : users) {
        Row row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue(str(u.getId()));
        row.createCell(1).setCellValue(str(u.getEmployeeId()));
        row.createCell(2).setCellValue(str(u.getFirstName() + " " + u.getLastName()));
        row.createCell(3).setCellValue(str(u.getEmail()));
        row.createCell(4).setCellValue(u.getDepartment() != null ? u.getDepartment().getName() : "");
        row.createCell(5).setCellValue(u.getDesignation() != null ? u.getDesignation().getName() : "");
        row.createCell(6).setCellValue(u.getLocation() != null ? u.getLocation().getName() : "");
        row.createCell(7).setCellValue(str(u.getStatus()));
        row.createCell(8).setCellValue(str(u.getCreatedAt()));
    }
    return toBytes(workbook);
}
 
// ── Role Distribution Report ──────────────────────────────────────────────
public byte[] generateRolesReport(String format, String sheetParam) throws Exception {  // ✅ both params
 
    String roleReportUrl = "http://localhost:8082/api/v1/admin/user-roles/report";
    List<Map> roleMappings = new ArrayList<>();
    try {
        ResponseEntity<List> response = restTemplate.getForEntity(roleReportUrl, List.class);
        if (response.getBody() != null) {
            roleMappings = response.getBody();
        }
    } catch (Exception e) {
        System.err.println("Role service call failed: " + e.getMessage());
    }
 
    List<User> users = userRepository.findAll();
    Map<Long, User> userMap = new HashMap<>();
    for (User u : users) userMap.put(u.getId(), u);
 
    Map<String, Integer> roleCountMap = new LinkedHashMap<>();
    Map<String, List<User>> roleUsersMap = new LinkedHashMap<>();
 
    for (Map mapping : roleMappings) {
        String roleName = str(mapping.get("roleName"));
        Object userIdObj = mapping.get("userId");
        if (userIdObj == null || roleName.isEmpty()) continue;
        Long userId = Long.valueOf(str(userIdObj));
        User user = userMap.get(userId);
        roleCountMap.merge(roleName, 1, Integer::sum);
        roleUsersMap.computeIfAbsent(roleName, k -> new ArrayList<>());
        if (user != null) roleUsersMap.get(roleName).add(user);
    }
 
    if (format.equals("csv")) {
        String sheet = sheetParam != null ? sheetParam : "1";  // ✅ sheetParam exists now
        StringBuilder sb = new StringBuilder();
        if (sheet.equals("2")) {
            sb.append("Role Name,Employee ID,Full Name,Email,Department,Designation,Status\n");
            for (Map.Entry<String, List<User>> entry : roleUsersMap.entrySet()) {
                for (User u : entry.getValue()) {
                    sb.append(String.join(",",
                        csvEscape(entry.getKey()),
                        csvEscape(str(u.getEmployeeId())),
                        csvEscape(str(u.getFirstName() + " " + u.getLastName())),
                        csvEscape(str(u.getEmail())),
                        csvEscape(str(u.getDepartment() != null ? u.getDepartment().getName() : "")),
                        csvEscape(str(u.getDesignation() != null ? u.getDesignation().getName() : "")),
                        csvEscape(str(u.getStatus()))
                    )).append("\n");
                }
            }
        } else {
            sb.append("Role Name,Total Users Assigned\n");
            for (Map.Entry<String, Integer> entry : roleCountMap.entrySet()) {
                sb.append(csvEscape(entry.getKey())).append(",").append(entry.getValue()).append("\n");
            }
        }
        return sb.toString().getBytes("UTF-8");
    }
 
    // Excel — 2 sheets
    Workbook workbook = new XSSFWorkbook();
 
    Sheet summarySheet = workbook.createSheet("Role Summary");
    createHeaderRow(workbook, summarySheet, new String[]{"Role Name", "Total Users Assigned"});
    int rowNum = 1;
    for (Map.Entry<String, Integer> entry : roleCountMap.entrySet()) {
        Row row = summarySheet.createRow(rowNum++);
        row.createCell(0).setCellValue(entry.getKey());
        row.createCell(1).setCellValue(entry.getValue());
    }
 
    Sheet detailSheet = workbook.createSheet("Role User Details");
    createHeaderRow(workbook, detailSheet,
        new String[]{"Role Name", "Employee ID", "Full Name", "Email", "Department", "Designation", "Status"});
    rowNum = 1;
    for (Map.Entry<String, List<User>> entry : roleUsersMap.entrySet()) {
        for (User u : entry.getValue()) {
            Row row = detailSheet.createRow(rowNum++);
            row.createCell(0).setCellValue(entry.getKey());
            row.createCell(1).setCellValue(str(u.getEmployeeId()));
            row.createCell(2).setCellValue(str(u.getFirstName() + " " + u.getLastName()));
            row.createCell(3).setCellValue(str(u.getEmail()));
            row.createCell(4).setCellValue(u.getDepartment() != null ? u.getDepartment().getName() : "");
            row.createCell(5).setCellValue(u.getDesignation() != null ? u.getDesignation().getName() : "");
            row.createCell(6).setCellValue(str(u.getStatus()));
        }
    }
    return toBytes(workbook);
}
 
    // ── Activity Report ───────────────────────────────────────────────────────
    public byte[] generateActivityReport(String format) throws Exception {
        List<User> users = userRepository.findAll();
 
        // BUG FIX: Use consistent header names matching the frontend column config
        String[] headers = {
            "User ID", "Employee ID", "Full Name", "Email",
            "Status", "First Login", "Account Locked", "Created At", "Updated At"
        };
 
        if (format.equals("csv")) {
            StringBuilder sb = new StringBuilder();
            sb.append(String.join(",", headers)).append("\n");
            for (User u : users) {
                sb.append(String.join(",",
                    csvEscape(str(u.getId())),
                    csvEscape(str(u.getEmployeeId())),
                    csvEscape(str(u.getFirstName() + " " + u.getLastName())),
                    csvEscape(str(u.getEmail())),
                    csvEscape(str(u.getStatus())),
                    csvEscape(str(u.isFirstLogin())),
                    csvEscape(str(u.isAccountLocked())),
                    csvEscape(str(u.getCreatedAt())),
                    csvEscape(str(u.getUpdatedAt()))
                )).append("\n");
            }
            return sb.toString().getBytes("UTF-8");
        }
 
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("User Activity");
        createHeaderRow(workbook, sheet, headers);
        int rowNum = 1;
        for (User u : users) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(str(u.getId()));
            row.createCell(1).setCellValue(str(u.getEmployeeId()));
            row.createCell(2).setCellValue(str(u.getFirstName() + " " + u.getLastName()));
            row.createCell(3).setCellValue(str(u.getEmail()));
            row.createCell(4).setCellValue(str(u.getStatus()));
            row.createCell(5).setCellValue(str(u.isFirstLogin()));
            row.createCell(6).setCellValue(str(u.isAccountLocked()));
            row.createCell(7).setCellValue(str(u.getCreatedAt()));
            row.createCell(8).setCellValue(str(u.getUpdatedAt()));
        }
        return toBytes(workbook);
    }
 
    // ── Debug helpers ─────────────────────────────────────────────────────────
    public List<Object[]> debugRoleUsers() {
        return userRepository.findAllUsersWithRoles();
    }
 
    public List<Object[]> debugRoleCounts() {
        return userRepository.findRoleWiseCount();
    }
 
    // ── Helpers ───────────────────────────────────────────────────────────────
    private void createHeaderRow(Workbook workbook, Sheet sheet, String[] headers) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(style);
            sheet.autoSizeColumn(i);
        }
    }
 
    private byte[] toBytes(Workbook workbook) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();
        return out.toByteArray();
    }
 
    private String str(Object val) {
        return val == null ? "" : val.toString();
    }
 
    // BUG FIX: Proper CSV escaping — wrap in quotes if value contains comma/quote/newline
    private String csvEscape(String val) {
        if (val == null) return "";
        if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
            return "\"" + val.replace("\"", "\"\"") + "\"";
        }
        return val;
    }
}
 
 