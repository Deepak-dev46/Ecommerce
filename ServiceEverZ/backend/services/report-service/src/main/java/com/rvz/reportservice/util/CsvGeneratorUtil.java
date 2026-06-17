package com.rvz.reportservice.util;

import com.rvz.reportservice.exception.InvalidFilterException;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Utility that converts a list of row-maps into a streaming CSV download.
 *
 * <p>Usage:
 * <pre>
 *   csvGeneratorUtil.writeToResponse(response, "ticket-volume", rows);
 * </pre>
 */
@Component

public class CsvGeneratorUtil {

    private static final Logger log = LoggerFactory.getLogger(CsvGeneratorUtil.class);

    private static final DateTimeFormatter FILENAME_FMT =
            DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Streams rows as a UTF-8 CSV attachment to the HTTP response.
     *
     * @param response   the {@link HttpServletResponse} to write into
     * @param reportType used to build the filename
     * @param rows       ordered list of {@code Map<String, Object>} rows;
     *                   keys of the first row become the CSV header
     */
    public void writeToResponse(HttpServletResponse response,
                                String reportType,
                                List<Map<String, Object>> rows) throws IOException {

        if (rows == null || rows.isEmpty()) {
            throw new InvalidFilterException("No data found for the applied filters. CSV export aborted.");
        }

        String filename = buildFilename(reportType);
        prepareResponse(response, filename);

        List<String> headers = new ArrayList<>(rows.get(0).keySet());

        try (PrintWriter writer = response.getWriter()) {
            writeLine(writer, headers);

            for (Map<String, Object> row : rows) {
                List<String> values = new ArrayList<>();
                for (String header : headers) {
                    values.add(escapeCell(row.get(header)));
                }
                writeLine(writer, values);
            }

            writer.flush();
        }

        log.info("CSV export complete: file={}, rows={}", filename, rows.size());
    }

    /**
     * Generates CSV content as a {@link String} (useful for testing / in-memory usage).
     */
    public String generateCsvString(List<Map<String, Object>> rows) {
        if (rows == null || rows.isEmpty()) {
            return "";
        }

        StringBuilder sb = new StringBuilder();
        List<String> headers = new ArrayList<>(rows.get(0).keySet());

        sb.append(buildLine(headers)).append("\n");

        for (Map<String, Object> row : rows) {
            List<String> values = new ArrayList<>();
            for (String header : headers) {
                values.add(escapeCell(row.get(header)));
            }
            sb.append(buildLine(values)).append("\n");
        }

        return sb.toString();
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void prepareResponse(HttpServletResponse response, String filename) {
        response.setContentType("text/csv; charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Content-Disposition",
                "attachment; filename=\"" + filename + "\"");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    }

    private String buildFilename(String reportType) {
        String ts = LocalDateTime.now().format(FILENAME_FMT);
        return reportType.toLowerCase().replace(" ", "_") + "_" + ts + ".csv";
    }

    private void writeLine(PrintWriter writer, List<String> cells) {
        writer.println(buildLine(cells));
    }

    private String buildLine(List<String> cells) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < cells.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(cells.get(i) != null ? cells.get(i) : "");
        }
        return sb.toString();
    }

    /**
     * RFC-4180 cell escaping: wrap in quotes if the value contains a comma,
     * double-quote, or newline.  Double any embedded double-quotes.
     */
    private String escapeCell(Object value) {
        if (value == null) return "";
        String str = value.toString();
        if (str.contains(",") || str.contains("\"") || str.contains("\n") || str.contains("\r")) {
            str = "\"" + str.replace("\"", "\"\"") + "\"";
        }
        return str;
    }
}
