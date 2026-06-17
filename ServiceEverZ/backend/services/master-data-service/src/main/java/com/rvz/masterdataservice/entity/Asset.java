package com.rvz.masterdataservice.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "assets")
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /** Asset tag / serial number shown to the user */
    @Column(name = "asset_tag")
    private String assetTag;

    /** Friendly name: "Laptop – SER-LP-001" */
    @Column(name = "asset_name")
    private String assetName;

    @Column(name = "asset_type")
    private String assetType;       // e.g. LAPTOP, DESKTOP, MONITOR, MOBILE

    /** FK → users.id – owner of this asset */
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "status")
    private String status;           // ACTIVE, RETIRED, IN_REPAIR

    public Asset() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAssetTag() { return assetTag; }
    public void setAssetTag(String assetTag) { this.assetTag = assetTag; }

    public String getAssetName() { return assetName; }
    public void setAssetName(String assetName) { this.assetName = assetName; }

    public String getAssetType() { return assetType; }
    public void setAssetType(String assetType) { this.assetType = assetType; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
