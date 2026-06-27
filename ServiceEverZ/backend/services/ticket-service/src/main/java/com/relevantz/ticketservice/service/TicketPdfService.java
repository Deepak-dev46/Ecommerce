package com.relevantz.ticketservice.service;
 
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
 
import org.springframework.stereotype.Service;
 
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.ColumnText;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.LineSeparator;
 
import com.relevantz.ticketservice.dto.TicketResponse;
import com.relevantz.ticketservice.exception.ResourceNotFoundException;
 

/**
 * Generates a structured PDF for a single ticket.
 * Uses OpenPDF (com.github.librepdf:openpdf).
 *
 * This service is entirely self-contained — it calls TicketService.getTicketById()
 * and never writes to the database.
 */
@Service
public class TicketPdfService {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");

    // Brand colours matching ServiceEverZ navy theme
    private static final Color NAVY       = new Color(39, 35, 92);
    private static final Color LIGHT_BLUE = new Color(238, 233, 254);
    private static final Color GRAY_TEXT  = new Color(75, 85, 99);
    private static final Color GRAY_BG    = new Color(249, 250, 251);
    private static final Color BORDER     = new Color(229, 231, 235);

    private final TicketService ticketService;

    public TicketPdfService(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    /**
     * Builds a PDF for the given ticket ID and returns the raw bytes.
     *
     * @throws ResourceNotFoundException if the ticket does not exist
     */
    public byte[] generate(Long ticketId) {
        TicketResponse ticket = ticketService.getTicketById(ticketId);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 40, 40, 50, 40);
            PdfWriter writer = PdfWriter.getInstance(doc, out);
            writer.setPageEvent(new HeaderFooter(ticket));

            doc.open();

            addHeader(doc, ticket);
            doc.add(Chunk.NEWLINE);
            addSection(doc, "Service Details", new String[][]{
                    {"Ticket Number",  safe(ticket.getTicketNumber())},
                    {"Status",         safe(ticket.getStatus())},
                    {"Priority",       safe(ticket.getPriority())},
                    {"Type",           safe(ticket.getType())},
                    {"Category",       safe(ticket.getCategory())},
                    {"Sub-Category",   safe(ticket.getSubCategory())},
                    {"Item",           safe(ticket.getItem())},
            });

            addSection(doc, "Requester & Assignment", new String[][]{
                    {"Requester",      safe(ticket.getRequesterName())},
                    {"Assignee",       ticket.getAssigneeName() != null ? ticket.getAssigneeName() : "Unassigned"},
                    {"Location",       safe(ticket.getLocation())},
                    {"Mobile",         safe(ticket.getMobileNumber())},
            });

            addSection(doc, "Ticket Timeline", new String[][]{
                    {"Created At",     fmt(ticket.getCreatedAt())},
                    {"Updated At",     fmt(ticket.getUpdatedAt())},
                    {"SLA Deadline",   fmt(ticket.getSlaDeadline())},
                    {"SLA Breached",   ticket.getSlaBreached() != null && ticket.getSlaBreached() ? "Yes" : "No"},
                    {"SLA Paused",     ticket.getSlaPaused() != null && ticket.getSlaPaused() ? "Yes" : "No"},
            });

            // Description block
            addDescriptionBlock(doc, "Subject", safe(ticket.getSubject()));
            if (ticket.getDescription() != null && !ticket.getDescription().isBlank()) {
                // Strip HTML tags for clean PDF text
                String plainDesc = ticket.getDescription()
                        .replaceAll("<[^>]+>", " ")
                        .replaceAll("&nbsp;", " ")
                        .replaceAll("\\s{2,}", " ")
                        .trim();
                addDescriptionBlock(doc, "Description", plainDesc);
            }

            if (ticket.getResolutionNotes() != null && !ticket.getResolutionNotes().isBlank()) {
                addDescriptionBlock(doc, "Resolution Notes", ticket.getResolutionNotes());
            }

            doc.close();
            return out.toByteArray();

        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF for ticket " + ticketId + ": " + e.getMessage(), e);
        }
    }

    // ── Layout helpers ────────────────────────────────────────────────────────

    private void addHeader(Document doc, TicketResponse ticket) throws DocumentException {
        // Top banner
        PdfPTable banner = new PdfPTable(1);
        banner.setWidthPercentage(100);

        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(NAVY);
        cell.setPadding(14);
        cell.setBorder(Rectangle.NO_BORDER);

        Paragraph title = new Paragraph();
        title.add(new Chunk("ServiceEverZ  ", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Font.NORMAL, Color.WHITE)));
        title.add(new Chunk("— Ticket Details", FontFactory.getFont(FontFactory.HELVETICA, 13, Font.NORMAL, new Color(180, 175, 230))));
        cell.addElement(title);

        Paragraph sub = new Paragraph(
                safe(ticket.getTicketNumber()) + "   |   " + safe(ticket.getStatus()),
                FontFactory.getFont(FontFactory.HELVETICA, 9, Font.NORMAL, new Color(196, 193, 230))
        );
        sub.setSpacingBefore(4);
        cell.addElement(sub);

        banner.addCell(cell);
        doc.add(banner);
    }

    private void addSection(Document doc, String heading, String[][] rows) throws DocumentException {
        // Section heading
        Paragraph h = new Paragraph(heading,
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.NORMAL, NAVY));
        h.setSpacingBefore(14);
        h.setSpacingAfter(4);
        doc.add(h);

        // Underline
        LineSeparator sep = new LineSeparator(1f, 100f, LIGHT_BLUE, Element.ALIGN_LEFT, -2);
        doc.add(new Chunk(sep));

        PdfPTable table = new PdfPTable(new float[]{2f, 3f});
        table.setWidthPercentage(100);
        table.setSpacingBefore(6);

        boolean alt = false;
        for (String[] row : rows) {
            Color bg = alt ? GRAY_BG : Color.WHITE;

            PdfPCell label = new PdfPCell(new Phrase(row[0],
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8.5f, Font.NORMAL, GRAY_TEXT)));
            label.setBackgroundColor(bg);
            label.setPadding(6);
            label.setBorderColor(BORDER);
            label.setBorderWidth(0.5f);

            PdfPCell value = new PdfPCell(new Phrase(row[1],
                    FontFactory.getFont(FontFactory.HELVETICA, 8.5f, Font.NORMAL, new Color(31, 41, 55))));
            value.setBackgroundColor(bg);
            value.setPadding(6);
            value.setBorderColor(BORDER);
            value.setBorderWidth(0.5f);

            table.addCell(label);
            table.addCell(value);
            alt = !alt;
        }
        doc.add(table);
    }

    private void addDescriptionBlock(Document doc, String label, String content) throws DocumentException {
        Paragraph h = new Paragraph(label,
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.NORMAL, NAVY));
        h.setSpacingBefore(14);
        h.setSpacingAfter(4);
        doc.add(h);

        LineSeparator sep = new LineSeparator(1f, 100f, LIGHT_BLUE, Element.ALIGN_LEFT, -2);
        doc.add(new Chunk(sep));

        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);
        table.setSpacingBefore(6);

        PdfPCell cell = new PdfPCell(new Phrase(content,
                FontFactory.getFont(FontFactory.HELVETICA, 8.5f, Font.NORMAL, new Color(31, 41, 55))));
        cell.setPadding(10);
        cell.setBorderColor(BORDER);
        cell.setBorderWidth(0.5f);
        cell.setBackgroundColor(GRAY_BG);
        cell.setLeading(0, 1.5f);
        table.addCell(cell);
        doc.add(table);
    }

    // ── Utilities ─────────────────────────────────────────────────────────────

    private String safe(Object val) {
        return val != null ? val.toString() : "—";
    }

    private String fmt(java.time.LocalDateTime dt) {
        return dt != null ? dt.format(FMT) : "—";
    }

    // ── Page header / footer via PdfPageEventHelper ───────────────────────────

    private static class HeaderFooter extends PdfPageEventHelper {

        private final TicketResponse ticket;

        HeaderFooter(TicketResponse ticket) {
            this.ticket = ticket;
        }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContent();

            // Footer line
            cb.setColorStroke(new Color(229, 231, 235));
            cb.setLineWidth(0.5f);
            cb.moveTo(document.left(), document.bottom() - 8);
            cb.lineTo(document.right(), document.bottom() - 8);
            cb.stroke();

            // Footer text
            Font footFont = FontFactory.getFont(FontFactory.HELVETICA, 7, Font.NORMAL, new Color(156, 163, 175));
            Phrase left  = new Phrase("ServiceEverZ ITSM Platform — Confidential", footFont);
            Phrase right = new Phrase("Page " + writer.getPageNumber(), footFont);

            PdfContentByte under = writer.getDirectContent();
            ColumnText.showTextAligned(under, Element.ALIGN_LEFT,  left,  document.left(),  document.bottom() - 20, 0);
            ColumnText.showTextAligned(under, Element.ALIGN_RIGHT, right, document.right(), document.bottom() - 20, 0);
        }
    }
}
