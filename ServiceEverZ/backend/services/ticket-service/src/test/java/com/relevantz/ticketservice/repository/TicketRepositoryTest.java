//package com.relevantz.ticketservice.repository;
//
//import static org.junit.jupiter.api.Assertions.*;
//
//import java.util.List;
//
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
//import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
//
//import com.relevantz.ticketservice.model.Priority;
//import com.relevantz.ticketservice.model.Ticket;
//import com.relevantz.ticketservice.model.TicketStatus;
//
//@DataJpaTest
//@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
//class TicketRepositoryTest {
//
//    @Autowired
//    private TicketRepository repository;
//
//    // ✅ Helper method to create valid ticket
//    private Ticket createTicket(Long requesterId, Long assigneeId, String ticketNumber) {
//        Ticket ticket = new Ticket();
//
//        ticket.setSubject("Test Ticket");
//        ticket.setDescription("Test Description");
//
//        // ✅ REQUIRED FIELDS
//        ticket.setPriority(Priority.HIGH);
//        ticket.setStatus(TicketStatus.OPEN);
//
//        ticket.setRequesterId(requesterId);
//        ticket.setRequesterName("User");
//
//        ticket.setAssigneeId(assigneeId);
//        ticket.setAssigneeName("Support");
//
//        ticket.setTicketNumber(ticketNumber);
//
//        return repository.save(ticket);
//    }
//
//    // ✅ 1. Test findByRequesterId
//    @Test
//    void findByRequesterIdOrderByUpdatedAtDesc_shouldReturnTickets() {
//
//        createTicket(1L, 10L, "TKT-101");
//        createTicket(1L, 11L, "TKT-102");
//        createTicket(2L, 12L, "TKT-103");
//
//        List<Ticket> result =
//                repository.findByRequesterIdOrderByUpdatedAtDesc(1L);
//
//        assertNotNull(result);
//        assertEquals(2, result.size());
//    }
//
//    // ✅ 2. Test findByAssigneeId
//    @Test
//    void findByAssigneeIdOrderByUpdatedAtDesc_shouldReturnTickets() {
//
//        createTicket(1L, 100L, "TKT-201");
//        createTicket(2L, 100L, "TKT-202");
//        createTicket(3L, 200L, "TKT-203");
//
//        List<Ticket> result =
//                repository.findByAssigneeIdOrderByUpdatedAtDesc(100L);
//
//        assertNotNull(result);
//        assertEquals(2, result.size());
//    }
//
//
//    // ✅ 4. Negative test
//    @Test
//    void findByRequesterId_shouldReturnEmptyList() {
//
//        List<Ticket> result =
//                repository.findByRequesterIdOrderByUpdatedAtDesc(999L);
//
//        assertTrue(result.isEmpty());
//    }
//}