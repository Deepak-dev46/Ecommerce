//package com.relevantz.ticketservice.repository;
//
//import static org.junit.jupiter.api.Assertions.assertEquals;
//import static org.junit.jupiter.api.Assertions.assertNotNull;
//import static org.junit.jupiter.api.Assertions.assertTrue;
//
//import java.util.List;
//
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
//import org.springframework.boot.test.context.SpringBootTest;
//
//import com.relevantz.ticketservice.model.Priority;
//import com.relevantz.ticketservice.model.Ticket;
//import com.relevantz.ticketservice.model.TicketHistory;
//import com.relevantz.ticketservice.model.TicketStatus;
//
//import jakarta.transaction.Transactional;
//
//@SpringBootTest
//@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
//@Transactional
//class TicketHistoryRepositoryTest {
//
//    @Autowired
//    private TicketHistoryRepository historyRepository;
//
//    @Autowired
//    private TicketRepository ticketRepository;
//
//    @Test
//    void findByTicketId_shouldReturnHistory() {
//
//        // ✅ CREATE VALID TICKET (ALL REQUIRED FIELDS)
//        Ticket ticket = new Ticket();
//        ticket.setSubject("Test Ticket");
//        ticket.setDescription("Test Description");
//
//        ticket.setPriority(Priority.HIGH);           // ✅ ENUM
//        ticket.setStatus(TicketStatus.OPEN);         // ✅ ENUM
//        ticket.setRequesterId(1L);
//        ticket.setRequesterName("Test User");
//        ticket.setTicketNumber("TKT-2001");
//
//        ticket = ticketRepository.save(ticket);
//
//        // ✅ CREATE HISTORY
//        TicketHistory history = new TicketHistory();
//        history.setTicket(ticket);
//
//        history.setDescription("Status changed");
//        history.setFromStatus(TicketStatus.OPEN);
//        history.setToStatus(TicketStatus.IN_PROGRESS);
//        history.setChangedBy("Admin");
//
//        historyRepository.save(history);
//
//        // ✅ CALL METHOD
//        List<TicketHistory> result =
//                historyRepository.findByTicketId(ticket.getId());
//
//        // ✅ ASSERTIONS
//        assertNotNull(result);
//        assertEquals(1, result.size());
//        assertEquals("Status changed", result.get(0).getDescription());
//    }
//
//    @Test
//    void findByTicketId_shouldReturnEmptyList() {
//
//        List<TicketHistory> result =
//                historyRepository.findByTicketId(999L);
//
//        assertNotNull(result);
//        assertTrue(result.isEmpty());
//    }
//}
