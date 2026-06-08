//package com.relevantz.ticketservice.service;
//
//import com.relevantz.ticketservice.dto.CreateTicketRequest;
//import com.relevantz.ticketservice.dto.SubmitTicketRequest;
//import com.relevantz.ticketservice.dto.TicketResponse;
//import java.util.List;
//
///**
// * Our service interface — handles full draft → submit → approval flow.
// * Returns their TicketResponse so the My Tickets page works unchanged.
// */
//public interface OurTicketService {
//    TicketResponse saveDraft(CreateTicketRequest request);
//    TicketResponse createAndSubmit(CreateTicketRequest request);
//    TicketResponse submitDraft(SubmitTicketRequest request);
//    List<TicketResponse> getTicketsByUser(Long userId);
//}

package com.relevantz.ticketservice.service;

import com.relevantz.ticketservice.dto.CreateTicketRequest;
import com.relevantz.ticketservice.dto.SubmitTicketRequest;
import com.relevantz.ticketservice.dto.TicketResponse;
import java.util.List;

public interface OurTicketService {
    TicketResponse saveDraft(CreateTicketRequest request);

    TicketResponse updateDraft(Long ticketId, CreateTicketRequest request);

    TicketResponse createAndSubmit(CreateTicketRequest request);

    TicketResponse submitDraft(SubmitTicketRequest request);

    List<TicketResponse> getTicketsByUser(Long userId);

    TicketResponse resolveTicket(Long ticketId, String resolutionMessage, Long supportPersonId);

    TicketResponse userAcknowledge(Long ticketId, Long userId);

    void deleteDraft(Long ticketId);
}