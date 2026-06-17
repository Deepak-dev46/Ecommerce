package com.relevantz.ticketservice.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.relevantz.ticketservice.dto.AddCommentRequest;
import com.relevantz.ticketservice.dto.CommentResponse;
import com.relevantz.ticketservice.model.TicketComment;
import com.relevantz.ticketservice.repository.TicketCommentRepository;

@Service
public class CommentService {

    private final TicketCommentRepository repo;

    public CommentService(TicketCommentRepository repo) {
        this.repo = repo;
    }

    // ✅ GET COMMENTS
    public List<CommentResponse> getComments(Long ticketId) {
        return repo
                .findByTicketIdOrderByCreatedAtAsc(ticketId)  // ✅ FIXED
                .stream()
                .map(CommentResponse::from)
                .toList();
    }

    // ✅ ADD COMMENT
    public CommentResponse addComment(Long ticketId, AddCommentRequest req) {

        TicketComment c = new TicketComment();

        c.setTicketId(ticketId);
        c.setUserId(req.getAuthorId());    // ✅ correct
        c.setComment(req.getBody());       // ✅ correct
        c.setCreatedBy(req.getAuthorId());
        c.setAuthorName(req.getAuthorName());
        c.setAuthorRole(req.getAuthorRole()); // ✅ correct

        return CommentResponse.from(repo.save(c)); // ✅ FIXED
    }
}