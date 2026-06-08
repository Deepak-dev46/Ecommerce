package com.relevantz.ticketservice.model;


import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_sla_tracking")
public class TicketSlaTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long ticketId;

    private LocalDateTime slaStartTime;

    private LocalDateTime slaPausedAt;

    private Long totalPausedMinutes = 0L;

    @Enumerated(EnumType.STRING)
    private SlaStatus slaStatus;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getTicketId() {
		return ticketId;
	}

	public void setTicketId(Long ticketId) {
		this.ticketId = ticketId;
	}

	public LocalDateTime getSlaStartTime() {
		return slaStartTime;
	}

	public void setSlaStartTime(LocalDateTime slaStartTime) {
		this.slaStartTime = slaStartTime;
	}

	public LocalDateTime getSlaPausedAt() {
		return slaPausedAt;
	}

	public void setSlaPausedAt(LocalDateTime slaPausedAt) {
		this.slaPausedAt = slaPausedAt;
	}

	public Long getTotalPausedMinutes() {
		return totalPausedMinutes;
	}

	public void setTotalPausedMinutes(Long totalPausedMinutes) {
		this.totalPausedMinutes = totalPausedMinutes;
	}

	public SlaStatus getSlaStatus() {
		return slaStatus;
	}

	public void setSlaStatus(SlaStatus slaStatus) {
		this.slaStatus = slaStatus;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
    
    


}