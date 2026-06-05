package com.rvz.serviceeverz.service;

import com.rvz.serviceeverz.dto.response.ProblemAttachmentResponse;
import com.rvz.serviceeverz.enums.AttachmentSection;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProblemAttachmentService {

    /**
     * Upload a file and associate it with a problem section.
     *
     * @param problemId        the problem to attach the file to
     * @param section          SOLUTION | ROOT_CAUSE | WORKAROUND | PERMANENT_FIX
     * @param file             the multipart file
     * @param uploadedBySpId   the SP performing the upload
     */
    ProblemAttachmentResponse uploadAttachment(Long problemId,
                                               AttachmentSection section,
                                               MultipartFile file,
                                               Long uploadedBySpId);

    /** List all attachments for a problem (optionally filtered by section). */
    List<ProblemAttachmentResponse> getAttachments(Long problemId, AttachmentSection section);

    /** Load the physical file as a Spring Resource for streaming download. */
    Resource loadAttachmentAsResource(Long problemId, Long attachmentId);

    /** Return the metadata DTO for a single attachment. */
    ProblemAttachmentResponse getAttachmentById(Long problemId, Long attachmentId);

    /** Delete an attachment record and its physical file. */
    void deleteAttachment(Long problemId, Long attachmentId);
}
