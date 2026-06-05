package com.rvz.serviceeverz.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Stores category-specific technical specifications for an asset.
 * Uses a key-value model so any number of spec fields can be stored
 * without schema changes (e.g.  RAM=16GB, Storage=512GB, Display=15.6").
 *
 * Lifecycle: created/updated alongside the Asset via AssetServiceImpl.
 */
@Entity
@Table(name = "asset_specifications",
       uniqueConstraints = @UniqueConstraint(columnNames = {"asset_id", "spec_key"}))
public class AssetSpecification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @Column(name = "spec_key", nullable = false, length = 100)
    private String specKey;          // e.g. "RAM", "Storage", "Display"

    @Column(name = "spec_value", nullable = false, length = 255)
    private String specValue;        // e.g. "16GB", "512GB SSD", "15.6 FHD"

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate
    void preUpdate()  { updatedAt = LocalDateTime.now(); }

    // ── Getters & Setters ────────────────────────────────────────
    public Long getId()                  { return id; }
    public void setId(Long id)           { this.id = id; }
    public Asset getAsset()              { return asset; }
    public void setAsset(Asset a)        { this.asset = a; }
    public String getSpecKey()           { return specKey; }
    public void setSpecKey(String v)     { specKey = v; }
    public String getSpecValue()         { return specValue; }
    public void setSpecValue(String v)   { specValue = v; }
    public LocalDateTime getCreatedAt()  { return createdAt; }
    public LocalDateTime getUpdatedAt()  { return updatedAt; }
}
