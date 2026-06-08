package com.rvz.actionservice.config;

import com.rvz.actionservice.dto.response.ActionResponse;
import com.rvz.actionservice.entity.TicketAction;
import org.springframework.stereotype.Component;

@Component
public class ActionMapper {
    public ActionResponse toResponse(TicketAction entity) {
        ActionResponse dto = new ActionResponse();
        dto.setActionId(entity.getActionId());
        dto.setTicketId(entity.getTicketId());
        dto.setActionType(entity.getActionType());
        dto.setStatus(entity.getStatus());
        dto.setComments(entity.getComments());
        dto.setActionBy(entity.getActionBy());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
