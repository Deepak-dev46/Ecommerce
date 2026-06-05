package com.rvz.slaservice.config;

import com.rvz.slaservice.dto.response.SlaResponse;
import com.rvz.slaservice.entity.TicketSla;
import org.springframework.stereotype.Component;

@Component
public class SlaMapper {
    public SlaResponse toResponse(TicketSla entity) {
        SlaResponse dto = new SlaResponse();
        dto.setSlaId(entity.getSlaId());
        dto.setTicketId(entity.getTicketId());
        dto.setStatus(entity.getStatus());
        dto.setStartedAt(entity.getStartedAt());
        dto.setPausedAt(entity.getPausedAt());
        dto.setResumedAt(entity.getResumedAt());
        dto.setCompletedAt(entity.getCompletedAt());
        dto.setDueAt(entity.getDueAt());
        dto.setTotalPausedMinutes(entity.getTotalPausedMinutes());
        dto.setBreached(entity.getBreached());
        return dto;
    }
}
