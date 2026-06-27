package com.relevantz.ticketservice.dto;

/**
 * Lightweight response returned by the duplicate-warning endpoint.
 * Contains only what the frontend panel needs to display.
 */
public class SimilarTicketResponse {

    private Long ticketId;
    private String ticketNumber;
    private String subject;
    private String status;
    private String categoryName;
    private String subCategoryName;
    private String itemName;
    private int matchScore; // 0–100 rough keyword match %

    public SimilarTicketResponse() {}

    public SimilarTicketResponse(Long ticketId, String ticketNumber, String subject,
                                  String status, String categoryName,
                                  String subCategoryName, String itemName, int matchScore) {
        this.ticketId      = ticketId;
        this.ticketNumber  = ticketNumber;
        this.subject       = subject;
        this.status        = status;
        this.categoryName  = categoryName;
        this.subCategoryName = subCategoryName;
        this.itemName      = itemName;
        this.matchScore    = matchScore;
    }

    public Long   getTicketId()         { return ticketId; }
    public void   setTicketId(Long v)   { this.ticketId = v; }

    public String getTicketNumber()            { return ticketNumber; }
    public void   setTicketNumber(String v)    { this.ticketNumber = v; }

    public String getSubject()                 { return subject; }
    public void   setSubject(String v)         { this.subject = v; }

    public String getStatus()                  { return status; }
    public void   setStatus(String v)          { this.status = v; }

    public String getCategoryName()            { return categoryName; }
    public void   setCategoryName(String v)    { this.categoryName = v; }

    public String getSubCategoryName()         { return subCategoryName; }
    public void   setSubCategoryName(String v) { this.subCategoryName = v; }

    public String getItemName()                { return itemName; }
    public void   setItemName(String v)        { this.itemName = v; }

    public int    getMatchScore()              { return matchScore; }
    public void   setMatchScore(int v)         { this.matchScore = v; }
}
