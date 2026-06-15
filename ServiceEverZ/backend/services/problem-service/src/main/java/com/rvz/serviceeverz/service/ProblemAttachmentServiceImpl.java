package com.rvz.serviceeverz.service;

import com.rvz.serviceeverz.client.UserFeignClient;
import com.rvz.serviceeverz.dto.response.ProblemAttachmentResponse;
import com.rvz.serviceeverz.entity.Problem;
import com.rvz.serviceeverz.entity.ProblemAttachment;
import com.rvz.serviceeverz.enums.AttachmentSection;
import com.rvz.serviceeverz.exception.AttachmentNotFoundException;
import com.rvz.serviceeverz.exception.ProblemNotFoundException;
import com.rvz.serviceeverz.repository.ProblemAttachmentRepository;
import com.rvz.serviceeverz.repository.ProblemRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProblemAttachmentServiceImpl implements ProblemAttachmentService {

    private static final Logger log = LoggerFactory.getLogger(ProblemAttachmentServiceImpl.class);

    private final ProblemRepository            problemRepo;
    private final ProblemAttachmentRepository  attachmentRepo;
    private final UserFeignClient              userClient;

    /** Base directory where uploaded files are stored on disk */
    private final Path uploadRoot;

    public ProblemAttachmentServiceImpl(
            ProblemRepository problemRepo,
            ProblemAttachmentRepository attachmentRepo,
            UserFeignClient userClient,
            @Value("${problem.attachment.upload-dir:uploads/problem-attachments}") String uploadDir) {
        this.problemRepo    = problemRepo;
        this.attachmentRepo = attachmentRepo;
        this.userClient     = userClient;
        this.uploadRoot     = Paths.get(uploadDir).toAbsolutePath().normalize();

        // Create the root upload directory if it doesn't exist
        try {
            Files.createDirectories(this.uploadRoot);
            log.info("Attachment upload directory: {}", this.uploadRoot);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + this.uploadRoot, e);
        }
    }

    // ── Upload ────────────────────────────────────────────────────

    @Override
    @Transactional
    public ProblemAttachmentResponse uploadAttachment(Long problemId,
                                                      AttachmentSection section,
                                                      MultipartFile file,
                                                      Long uploadedBySpId) {
        Problem problem = problemRepo.findById(problemId)
                .orElseThrow(() -> new ProblemNotFoundException("Problem not found: " + problemId));

        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload an empty file.");
        }

        // Build a per-problem sub-directory so files stay organised
        Path problemDir = uploadRoot.resolve("problem_" + problemId);
        try {
            Files.createDirectories(problemDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create problem upload directory", e);
        }

        // Sanitise original name and generate a unique stored name
        String originalName  = StringUtils.cleanPath(file.getOriginalFilename() != null
                ? file.getOriginalFilename() : "unnamed");
        String extension     = "";
        int dotIdx = originalName.lastIndexOf('.');
        if (dotIdx >= 0) extension = originalName.substring(dotIdx); // e.g. ".pdf"
        String storedName    = UUID.randomUUID().toString() + extension;

        // Write to disk
        Path destination = problemDir.resolve(storedName);
        try {
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file: " + originalName, e);
        }

        // Persist metadata
        ProblemAttachment attachment = new ProblemAttachment();
        attachment.setProblem(problem);
        attachment.setSection(section);
        attachment.setOriginalFileName(originalName);
        attachment.setStoredFileName("problem_" + problemId + "/" + storedName);
        attachment.setContentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream");
        attachment.setFileSize(file.getSize());
        attachment.setUploadedBySpId(uploadedBySpId);

        ProblemAttachment saved = attachmentRepo.save(attachment);
        log.info("Attachment saved: id={}, problem={}, section={}, file={}",
                saved.getId(), problemId, section, originalName);

        return toResponse(saved);
    }

    // ── Query ─────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<ProblemAttachmentResponse> getAttachments(Long problemId, AttachmentSection section) {
        if (!problemRepo.existsById(problemId)) {
            throw new ProblemNotFoundException("Problem not found: " + problemId);
        }
        List<ProblemAttachment> list = (section == null)
                ? attachmentRepo.findByProblemId(problemId)
                : attachmentRepo.findByProblemIdAndSection(problemId, section);

        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProblemAttachmentResponse getAttachmentById(Long problemId, Long attachmentId) {
        ProblemAttachment attachment = resolveAttachment(problemId, attachmentId);
        return toResponse(attachment);
    }

    // ── Download ──────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Resource loadAttachmentAsResource(Long problemId, Long attachmentId) {
        ProblemAttachment attachment = resolveAttachment(problemId, attachmentId);
        try {
            Path filePath = uploadRoot.resolve(attachment.getStoredFileName()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new AttachmentNotFoundException(
                    "File not found on disk for attachment id=" + attachmentId);
        } catch (MalformedURLException e) {
            throw new AttachmentNotFoundException("Malformed path for attachment id=" + attachmentId);
        }
    }

    // ── Delete ────────────────────────────────────────────────────

    @Override
    @Transactional
    public void deleteAttachment(Long problemId, Long attachmentId) {
        ProblemAttachment attachment = resolveAttachment(problemId, attachmentId);

        // Remove physical file
        try {
            Path filePath = uploadRoot.resolve(attachment.getStoredFileName()).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Could not delete physical file for attachment id={}: {}", attachmentId, e.getMessage());
        }

        attachmentRepo.delete(attachment);
        log.info("Attachment deleted: id={}, problem={}", attachmentId, problemId);
    }

    // ── Helpers ───────────────────────────────────────────────────

    private ProblemAttachment resolveAttachment(Long problemId, Long attachmentId) {
        ProblemAttachment attachment = attachmentRepo.findById(attachmentId)
                .orElseThrow(() -> new AttachmentNotFoundException(
                        "Attachment not found: id=" + attachmentId));
        if (!attachment.getProblem().getId().equals(problemId)) {
            throw new AttachmentNotFoundException(
                    "Attachment " + attachmentId + " does not belong to problem " + problemId);
        }
        return attachment;
    }

    private String resolveName(Long userId) {
        if (userId == null) return null;
        try {
            var resp = userClient.getUserName(userId);
            return (resp != null && resp.getData() != null) ? resp.getData() : "User #" + userId;
        } catch (Exception e) {
            return "User #" + userId;
        }
    }

    private ProblemAttachmentResponse toResponse(ProblemAttachment a) {
        ProblemAttachmentResponse r = new ProblemAttachmentResponse();
        r.setId(a.getId());
        r.setProblemId(a.getProblem().getId());
        r.setProblemNumber(a.getProblem().getProblemNumber());
        r.setSection(a.getSection());
        r.setOriginalFileName(a.getOriginalFileName());
        r.setContentType(a.getContentType());
        r.setFileSize(a.getFileSize());
        r.setUploadedBySpId(a.getUploadedBySpId());
        r.setUploadedBySpName(resolveName(a.getUploadedBySpId()));
        r.setUploadedAt(a.getUploadedAt());
        // downloadUrl is set by the controller so it always has the correct base URL
        return r;
    }
}
