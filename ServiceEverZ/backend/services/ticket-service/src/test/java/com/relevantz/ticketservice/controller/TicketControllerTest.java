//package com.relevantz.ticketservice.controller;
//
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.anyLong;
//import static org.mockito.ArgumentMatchers.anyString;
//import static org.mockito.ArgumentMatchers.eq;
//import static org.mockito.Mockito.when;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.Map;
//
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
//import org.springframework.boot.test.mock.mockito.MockBean;
//import org.springframework.http.MediaType;
//import org.springframework.test.web.servlet.MockMvc;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.relevantz.ticketservice.dto.AddCommentRequest;
//import com.relevantz.ticketservice.dto.CommentResponse;
//import com.relevantz.ticketservice.dto.CreateTicketRequest;
//import com.relevantz.ticketservice.dto.HistoryResponse;
//import com.relevantz.ticketservice.dto.ReopenTicketRequest;
//import com.relevantz.ticketservice.dto.SlaResponse;
//import com.relevantz.ticketservice.dto.TicketResponse;
//import com.relevantz.ticketservice.dto.UpdateTicketStatusRequest;
//import com.relevantz.ticketservice.model.Priority;
//import com.relevantz.ticketservice.model.TicketStatus;
//import com.relevantz.ticketservice.service.TicketService;
//
//@WebMvcTest(TicketController.class)
//class TicketControllerTest {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @MockBean
//    private TicketService ticketService;
//
//    @Autowired
//    private ObjectMapper objectMapper;
//
//    private final TicketResponse ticketResponse = new TicketResponse();
//    private final CommentResponse commentResponse = new CommentResponse();
//    private final HistoryResponse historyResponse = new HistoryResponse();
//
//    private final SlaResponse slaResponse =
//            new SlaResponse("CRITICAL", LocalDateTime.now().plusHours(2), 7200);
//
//    // ✅ 1. GET tickets
//    @Test
//    void getMyTickets_shouldReturnList() throws Exception {
//        when(ticketService.getMyTickets(1L)).thenReturn(List.of(ticketResponse));
//
//        mockMvc.perform(get("/api/tickets")
//                        .param("userId", "1"))
//                .andExpect(status().isOk());
//    }
//
//    // ✅ 2. GET ticket by id
//    @Test
//    void getTicketById_shouldReturnTicket() throws Exception {
//        when(ticketService.getTicketById(1L)).thenReturn(ticketResponse);
//
//        mockMvc.perform(get("/api/tickets/1"))
//                .andExpect(status().isOk());
//    }
//
//    // ✅ 3. CREATE ticket
//    @Test
//    void createTicket_shouldReturnCreated() throws Exception {
//
//        CreateTicketRequest req = new CreateTicketRequest();
//        req.setSubject("Test Ticket");          // ✅ @NotBlank
//        req.setDescription("Test Desc");        // optional
//        req.setPriority(Priority.HIGH);         // ✅ @NotNull
//        req.setRequesterId(1L);                 // ✅ @NotNull
//        req.setRequesterName("Deepak");         // optional
//
//        when(ticketService.createTicket(any()))
//                .thenReturn(ticketResponse);
//
//        mockMvc.perform(post("/api/tickets")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(req)))
//                .andExpect(status().isCreated());
//    }
//
//    // ✅ 4. GET comments
//    @Test
//    void getComments_shouldReturnList() throws Exception {
//        when(ticketService.getComments(1L)).thenReturn(List.of(commentResponse));
//
//        mockMvc.perform(get("/api/tickets/1/comments"))
//                .andExpect(status().isOk());
//    }
//
//    // ✅ 5. ADD comment
//    @Test
//    void addComment_shouldReturnCreated() throws Exception {
//
//        AddCommentRequest req = new AddCommentRequest();
//        req.setBody("Test comment");
//        req.setAuthorId(1L);              // ✅ REQUIRED
//        req.setAuthorName("Deepak");      // ✅ REQUIRED (if @NotBlank)
//        req.setAuthorRole("USER");        // ✅ REQUIRED (if @NotBlank)
//
//        when(ticketService.addComment(eq(1L), any()))
//                .thenReturn(commentResponse);
//
//        mockMvc.perform(post("/api/tickets/1/comments")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(req)))
//                .andExpect(status().isCreated());
//    }
//    // ✅ 6. REOPEN
//    @Test
//    void reopenTicket_shouldReturnOk() throws Exception {
//        ReopenTicketRequest req = new ReopenTicketRequest();
//        req.setReason("Fix not working"); // ✅ Required
//
//        when(ticketService.reopenTicket(eq(1L), any()))
//                .thenReturn(ticketResponse);
//
//        mockMvc.perform(post("/api/tickets/1/reopen")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(req)))
//                .andExpect(status().isOk());
//    }
//
//    // ✅ 7. HISTORY
//    @Test
//    void getHistory_shouldReturnList() throws Exception {
//        when(ticketService.getHistory(1L)).thenReturn(List.of(historyResponse));
//
//        mockMvc.perform(get("/api/tickets/1/history"))
//                .andExpect(status().isOk());
//    }
//
//    // ✅ 8. ASSIGNED
//    @Test
//    void getAssignedTickets_shouldReturnList() throws Exception {
//        when(ticketService.getAssignedTickets(2L)).thenReturn(List.of(ticketResponse));
//
//        mockMvc.perform(get("/api/tickets/assigned")
//                        .param("assigneeId", "2"))
//                .andExpect(status().isOk());
//    }
//
//    // ✅ 9. UPDATE STATUS
//    @Test
//    void updateTicketStatus_shouldReturnOk() throws Exception {
//        UpdateTicketStatusRequest req = new UpdateTicketStatusRequest();
//        req.setStatus(TicketStatus.RESOLVED); // ✅ Required
//
//        when(ticketService.updateTicketStatus(eq(1L), any()))
//                .thenReturn(ticketResponse);
//
//        mockMvc.perform(patch("/api/tickets/1/status")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(req)))
//                .andExpect(status().isOk());
//    }
//
//    // ✅ 10. SLA
//    @Test
//    void getSla_shouldReturnOk() throws Exception {
//        when(ticketService.getTicketSla(1L)).thenReturn(slaResponse);
//
//        mockMvc.perform(get("/api/tickets/1/sla"))
//                .andExpect(status().isOk());
//    }
//
//    // ✅ 11. ASSIGN
//    @Test
//    void assignTicket_shouldReturnOk() throws Exception {
//        Map<String, Object> body = Map.of(
//                "assigneeId", 5,
//                "assigneeName", "John"
//        );
//
//        when(ticketService.assignTicket(anyLong(), anyLong(), anyString()))
//                .thenReturn(ticketResponse);
//
//        mockMvc.perform(put("/api/tickets/1/assign")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(body)))
//                .andExpect(status().isOk());
//    }
//}