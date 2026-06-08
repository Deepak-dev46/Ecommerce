//package com.relevantz.ticketservice.repository;
//
//import static org.junit.jupiter.api.Assertions.*;
//
//import java.util.List;
//
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
//import org.springframework.boot.test.context.SpringBootTest;
//
//import com.relevantz.ticketservice.model.Ticket;
//import com.relevantz.ticketservice.model.TicketComment;
//
//import jakarta.transaction.Transactional;
//
//@SpringBootTest
//@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
//@Transactional
//class TicketCommentRepositoryTest {
//
//    @Autowired
//    private TicketCommentRepository repository;
//
//    @Autowired
//    private TicketRepository ticketRepository;
//
//
//    @Test
//    void findByTicketId_shouldReturnEmptyList() {
//
//        List<TicketComment> result = repository.findByTicketId(999L);
//
//        assertNotNull(result);
//        assertTrue(result.isEmpty());
//    }
//}