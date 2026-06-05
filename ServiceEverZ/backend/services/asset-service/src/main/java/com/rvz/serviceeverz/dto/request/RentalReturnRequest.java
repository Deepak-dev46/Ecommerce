package com.rvz.serviceeverz.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
 
public class RentalReturnRequest {
    @NotNull private Long spId;
    @NotNull(message = "Return date is required") private LocalDate returnedDate;
    private String remarks;
 
    public Long getSpId() { return spId; } public void setSpId(Long v) { spId = v; }
    public LocalDate getReturnedDate() { return returnedDate; } public void setReturnedDate(LocalDate v) { returnedDate = v; }
    public String getRemarks() { return remarks; } public void setRemarks(String v) { remarks = v; }
}
 