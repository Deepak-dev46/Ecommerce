package com.rvz.serviceeverz.repository;

import com.rvz.serviceeverz.entity.ProblemAttachment;
import com.rvz.serviceeverz.enums.AttachmentSection;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProblemAttachmentRepository extends JpaRepository<ProblemAttachment, Long> {

    /** All attachments for a given problem */
    List<ProblemAttachment> findByProblemId(Long problemId);

    /** Attachments for a problem filtered by section */
    List<ProblemAttachment> findByProblemIdAndSection(Long problemId, AttachmentSection section);

    /** Delete all attachments for a problem (used when problem is deleted) */
    void deleteByProblemId(Long problemId);
}
