//package com.relevantz.ticketservice.service;
//
//import static org.junit.jupiter.api.Assertions.assertEquals;
//import static org.junit.jupiter.api.Assertions.assertNotNull;
//import static org.junit.jupiter.api.Assertions.assertThrows;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.Mockito.verify;
//import static org.mockito.Mockito.when;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.Optional;
//
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockitoAnnotations;
//
//import com.relevantz.ticketservice.dto.AddCommentRequest;
//import com.relevantz.ticketservice.dto.CommentResponse;
//import com.relevantz.ticketservice.dto.CreateTicketRequest;
//import com.relevantz.ticketservice.dto.ReopenTicketRequest;
//import com.relevantz.ticketservice.dto.SlaResponse;
//import com.relevantz.ticketservice.dto.TicketResponse;
//import com.relevantz.ticketservice.dto.UpdateTicketStatusRequest;
//import com.relevantz.ticketservice.exception.BadRequestException;
//import com.relevantz.ticketservice.exception.ResourceNotFoundException;
//import com.relevantz.ticketservice.model.Priority;
//import com.relevantz.ticketservice.model.Ticket;
//import com.relevantz.ticketservice.model.TicketComment;
//import com.relevantz.ticketservice.model.TicketStatus;
//import com.relevantz.ticketservice.repository.TicketCommentRepository;
//import com.relevantz.ticketservice.repository.TicketHistoryRepository;
//import com.relevantz.ticketservice.repository.TicketRepository;
//
//class TicketServiceTest {
//
//    @InjectMocks
//    private TicketService ticketService;
//
//    @Mock
//    private TicketRepository ticketRepository;
//
//    @Mock
//    private TicketCommentRepository commentRepository;
//
//    @Mock
//    private TicketHistoryRepository historyRepository;
//
//    @BeforeEach
//    void setup() {
//        MockitoAnnotations.openMocks(this);
//    }
//
//    // ✅ 1. getMyTickets
//    @Test
//    void getMyTickets_shouldReturnList() {
//        Ticket ticket = new Ticket();
//        when(ticketRepository.findByRequesterIdOrderByUpdatedAtDesc(1L))
//                .thenReturn(List.of(ticket));
//
//        List<TicketResponse> result = ticketService.getMyTickets(1L);
//
//        assertNotNull(result);
//        assertEquals(1, result.size());
//    }
//
//    // ✅ 2. getTicketById
//    @Test
//    void getTicketById_shouldReturnTicket() {
//        Ticket ticket = new Ticket();
//        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
//
//        TicketResponse result = ticketService.getTicketById(1L);
//
//        assertNotNull(result);
//    }
//
//    // ✅ 3. createTicket
//    @Test
//    void createTicket_shouldWork() {
//        CreateTicketRequest req = new CreateTicketRequest();
//        req.setSubject("Test");
//        req.setDescription("Desc");
//        req.setPriority(Priority.LOW);
//
//        Ticket savedTicket = new Ticket();
//        when(ticketRepository.save(any())).thenReturn(savedTicket);
//
//        TicketResponse response = ticketService.createTicket(req);
//
//        assertNotNull(response);
//        verify(ticketRepository).save(any());
//        verify(historyRepository).save(any());
//    }
//
//    // ✅ 4. getComments
//    @Test
//    void getComments_shouldReturnList() {
//
//        // ✅ Create a ticket
//        Ticket ticket = new Ticket();
//        ticket.setId(1L);
//
//        // ✅ Create a comment linked to the ticket
//        TicketComment comment = new TicketComment();
//        comment.setTicket(ticket);
//        comment.setBody("Test comment");
//
//        // ✅ Mock repository
//        when(commentRepository.findByTicketId(1L))
//                .thenReturn(List.of(comment));
//
//        // ✅ Call service
//        List<CommentResponse> result = ticketService.getComments(1L);
//
//        // ✅ Assert
//        assertNotNull(result);
//        assertEquals(1, result.size());
//    }
//    @Test
//    void addComment_shouldWork() {
//        Ticket ticket = new Ticket();
//        ticket.setId(1L);
//        ticket.setStatus(TicketStatus.OPEN);
//
//        when(ticketRepository.findById(1L))
//                .thenReturn(Optional.of(ticket));
//
//        TicketComment savedComment = new TicketComment();
//        savedComment.setTicket(ticket); // ✅ REQUIRED
//
//        when(commentRepository.save(any()))
//                .thenReturn(savedComment);
//
//        AddCommentRequest req = new AddCommentRequest();
//        req.setBody("Test comment");
//
//        CommentResponse response = ticketService.addComment(1L, req);
//
//        assertNotNull(response);
//    }
//    
//
//    // ✅ 6. addComment should fail when CLOSED
//    @Test
//    void addComment_shouldThrowException_whenClosed() {
//        Ticket ticket = new Ticket();
//        ticket.setStatus(TicketStatus.CLOSED);
//
//        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
//
//        AddCommentRequest req = new AddCommentRequest();
//        req.setBody("Test");
//
//        assertThrows(BadRequestException.class,
//                () -> ticketService.addComment(1L, req));
//    }
//
//    // ✅ 7. reopenTicket
//    @Test
//    void reopenTicket_shouldWork() {
//        Ticket ticket = new Ticket();
//        ticket.setId(1L);
//        ticket.setStatus(TicketStatus.RESOLVED);
//        ticket.setPriority(Priority.LOW); // ✅ IMPORTANT (needed for SLA)
//
//        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
//        when(ticketRepository.save(any())).thenReturn(ticket);
//
//        ReopenTicketRequest req = new ReopenTicketRequest();
//        req.setReason("Issue persists");
//
//        TicketResponse response = ticketService.reopenTicket(1L, req);
//
//        assertNotNull(response);
//    }
//
//    // ✅ 8. updateStatus
//    @Test
//    void updateTicketStatus_shouldWork() {
//        Ticket ticket = new Ticket();
//        ticket.setStatus(TicketStatus.OPEN);
//
//        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
//        when(ticketRepository.save(any())).thenReturn(ticket);
//
//        UpdateTicketStatusRequest req = new UpdateTicketStatusRequest();
//        req.setStatus(TicketStatus.RESOLVED);
//
//        TicketResponse response = ticketService.updateTicketStatus(1L, req);
//
//        assertNotNull(response);
//        verify(historyRepository).save(any());
//    }
//
//    // ✅ 9. updateStatus should fail when CLOSED
//    @Test
//    void updateTicketStatus_shouldFail_whenClosed() {
//        Ticket ticket = new Ticket();
//        ticket.setStatus(TicketStatus.CLOSED);
//
//        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
//
//        UpdateTicketStatusRequest req = new UpdateTicketStatusRequest();
//        req.setStatus(TicketStatus.RESOLVED);
//
//        assertThrows(BadRequestException.class,
//                () -> ticketService.updateTicketStatus(1L, req));
//    }
//
//    // ✅ 10. getAssignedTickets
//    @Test
//    void getAssignedTickets_shouldReturnList() {
//        when(ticketRepository.findByAssigneeIdOrderByUpdatedAtDesc(2L))
//                .thenReturn(List.of(new Ticket()));
//
//        List<TicketResponse> result = ticketService.getAssignedTickets(2L);
//
//        assertEquals(1, result.size());
//    }
//
//    // ✅ 11. getSla
//    @Test
//    void getSla_shouldWork() {
//        Ticket ticket = new Ticket();
//        ticket.setPriority(Priority.LOW);
//        ticket.setSlaDeadline(LocalDateTime.now().plusHours(10));
//
//        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
//
//        SlaResponse response = ticketService.getTicketSla(1L);
//
//        assertNotNull(response);
//    }
//
//    // ✅ 12. assignTicket
//    @Test
//    void assignTicket_shouldWork() {
//        Ticket ticket = new Ticket();
//        ticket.setStatus(TicketStatus.OPEN);
//
//        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
//        when(ticketRepository.save(any())).thenReturn(ticket);
//
//        TicketResponse response =
//                ticketService.assignTicket(1L, 2L, "John");
//
//        assertNotNull(response);
//        verify(historyRepository).save(any());
//    }
//
//    // ✅ 13. ticket not found
//    @Test
//    void shouldThrowNotFound() {
//        when(ticketRepository.findById(1L)).thenReturn(Optional.empty());
//
//        assertThrows(ResourceNotFoundException.class,
//                () -> ticketService.getTicketById(1L));
//    }
//}
