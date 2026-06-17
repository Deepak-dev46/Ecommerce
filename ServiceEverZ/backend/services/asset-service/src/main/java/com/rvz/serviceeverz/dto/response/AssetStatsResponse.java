package com.rvz.serviceeverz.dto.response;


import java.util.Map;
 
public class AssetStatsResponse {
    private long totalAssets, availableAssets, assignedAssets, underMaintenanceAssets, retiredAssets, ownedAssets, rentalAssets, rentalExpiringSoon;
    private Map<String, Long> countByCategory;
 
    public long getTotalAssets() { return totalAssets; } public void setTotalAssets(long v) { totalAssets = v; }
    public long getAvailableAssets() { return availableAssets; } public void setAvailableAssets(long v) { availableAssets = v; }
    public long getAssignedAssets() { return assignedAssets; } public void setAssignedAssets(long v) { assignedAssets = v; }
    public long getUnderMaintenanceAssets() { return underMaintenanceAssets; } public void setUnderMaintenanceAssets(long v) { underMaintenanceAssets = v; }
    public long getRetiredAssets() { return retiredAssets; } public void setRetiredAssets(long v) { retiredAssets = v; }
    public long getOwnedAssets() { return ownedAssets; } public void setOwnedAssets(long v) { ownedAssets = v; }
    public long getRentalAssets() { return rentalAssets; } public void setRentalAssets(long v) { rentalAssets = v; }
    public long getRentalExpiringSoon() { return rentalExpiringSoon; } public void setRentalExpiringSoon(long v) { rentalExpiringSoon = v; }
    public Map<String, Long> getCountByCategory() { return countByCategory; } public void setCountByCategory(Map<String, Long> v) { countByCategory = v; }
}
 