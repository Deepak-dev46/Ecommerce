package com.rvz.reportservice.util;

import com.rvz.reportservice.dto.ReportDTO;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Generates an Excel (.xlsx) file from a ReportDTO and streams it to the HTTP response.
 * Covers US-97: "Export reports to Excel" so offline analysis is possible.
 *
 * Positive acceptance:
 *  1. .xlsx downloads successfully with all report data.
 *  2. Column headers match report fields: ticketId, status, project, assignee, SLA status, resolution time.
 *  3. Data matches visible system report.
 *  4. File opens without errors in Excel or compatible tool.
 *
 * Negative acceptance:
 *  1. Report has no ticket data → file exports with headers only.
 *  2. Export service fails → caller handles IOException and returns error message.
 *  3. Non-Admin role → export button not visible (enforced in frontend; backend also returns 403 if role missing).
 */
@Component
public class ExcelGeneratorUtil {

    private static final Logger log = LoggerFactory.getLogger(ExcelGeneratorUtil.class);

    /**
     * Stream the report as an Excel workbook to the HTTP response.
     *
     * @param reportType short identifier used as the sheet name and filename prefix
     * @param report     the populated ReportDTO; rows must be non-null (empty list is fine)
     * @param response   the servlet response to write to
     */
    public void exportToExcel(String reportType, ReportDTO report, HttpServletResponse response)
            throws IOException {

        List<Map<String, Object>> rows = report.getRows();
        if (rows == null) {
            rows = List.of();
        }

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        String filename = reportType.toLowerCase().replace(" ", "_") + "_"
                + LocalDateTime.now().toString().substring(0, 10) + ".xlsx";
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet(sanitizeSheetName(reportType));

            // ── Header style ──────────────────────────────────────────────────
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 11);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setWrapText(false);

            // ── Date style ────────────────────────────────────────────────────
            CellStyle dateStyle = workbook.createCellStyle();
            CreationHelper createHelper = workbook.getCreationHelper();
            dateStyle.setDataFormat(createHelper.createDataFormat().getFormat("dd-mmm-yyyy hh:mm"));

            // ── Determine column keys ─────────────────────────────────────────
            List<String> keys;
            if (!rows.isEmpty()) {
                keys = List.copyOf(rows.get(0).keySet());
            } else {
                // No rows: write generic headers from ReportDTO if available
                keys = List.of("ticketId", "ticketNumber", "subject", "status", "priority",
                        "categoryName", "assigneeName", "slaStatus", "resolutionTimeMinutes",
                        "createdAt");
            }

            // ── Write header row ──────────────────────────────────────────────
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < keys.size(); i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(camelToTitle(keys.get(i)));
                cell.setCellStyle(headerStyle);
            }

            // ── Write data rows ───────────────────────────────────────────────
            int rowIdx = 1;
            for (Map<String, Object> dataRow : rows) {
                Row excelRow = sheet.createRow(rowIdx++);
                for (int col = 0; col < keys.size(); col++) {
                    Object val = dataRow.get(keys.get(col));
                    Cell cell = excelRow.createCell(col);
                    writeCell(cell, val, dateStyle);
                }
            }

            // ── Auto-size columns (up to 60 chars wide) ───────────────────────
            for (int i = 0; i < keys.size(); i++) {
                sheet.autoSizeColumn(i);
                int width = sheet.getColumnWidth(i);
                if (width > 15000) sheet.setColumnWidth(i, 15000);
            }

            workbook.write(response.getOutputStream());
            response.getOutputStream().flush();
            log.info("Excel export complete: {} rows, {} cols, file={}", rows.size(), keys.size(), filename);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void writeCell(Cell cell, Object val, CellStyle dateStyle) {
        if (val == null) {
            cell.setCellValue("");
            return;
        }
        if (val instanceof Number) {
            cell.setCellValue(((Number) val).doubleValue());
        } else if (val instanceof Boolean) {
            cell.setCellValue((Boolean) val);
        } else if (val instanceof LocalDateTime ldt) {
            cell.setCellValue(ldt);
            cell.setCellStyle(dateStyle);
        } else if (val instanceof List<?> list) {
            // date arrays from JPA [year,month,day,...]
            if (!list.isEmpty() && list.get(0) instanceof Number) {
                try {
                    int year  = ((Number) list.get(0)).intValue();
                    int month = ((Number) list.get(1)).intValue();
                    int day   = ((Number) list.get(2)).intValue();
                    int hour  = list.size() > 3 ? ((Number) list.get(3)).intValue() : 0;
                    int min   = list.size() > 4 ? ((Number) list.get(4)).intValue() : 0;
                    cell.setCellValue(LocalDateTime.of(year, month, day, hour, min));
                    cell.setCellStyle(dateStyle);
                    return;
                } catch (Exception ignored) {}
            }
            cell.setCellValue(val.toString());
        } else {
            cell.setCellValue(val.toString());
        }
    }

    /** Convert camelCase key to "Title Case With Spaces". */
    private String camelToTitle(String key) {
        String spaced = key.replaceAll("([A-Z])", " $1");
        return Character.toUpperCase(spaced.charAt(0)) + spaced.substring(1).trim();
    }

    /** Excel sheet names cannot exceed 31 chars or contain special characters. */
    private String sanitizeSheetName(String name) {
        String safe = name.replaceAll("[\\[\\]\\*/?:\\\\]", "").trim();
        return safe.length() > 31 ? safe.substring(0, 31) : (safe.isEmpty() ? "Report" : safe);
    }
}
