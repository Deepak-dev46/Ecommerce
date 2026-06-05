package com.rvz.serviceeverz.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rvz.serviceeverz.client.IncidentFeignClient;
import com.rvz.serviceeverz.client.UserFeignClient;
import com.rvz.serviceeverz.dto.request.CreateProblemRequest;
import com.rvz.serviceeverz.dto.request.LinkIncidentRequest;
import com.rvz.serviceeverz.dto.request.PermanentFixRequest;
import com.rvz.serviceeverz.dto.request.RcaRequest;
import com.rvz.serviceeverz.dto.request.WorkaroundRequest;
import com.rvz.serviceeverz.dto.response.KnownErrorRecordResponse;
import com.rvz.serviceeverz.dto.response.ProblemResponse;
import com.rvz.serviceeverz.entity.KnownErrorRecord;
import com.rvz.serviceeverz.entity.Problem;
import com.rvz.serviceeverz.entity.ProblemCategory;
import com.rvz.serviceeverz.entity.ProblemIncidentLink;
import com.rvz.serviceeverz.enums.ProblemPriority;
import com.rvz.serviceeverz.enums.ProblemStatus;
import com.rvz.serviceeverz.exception.ProblemNotFoundException;
import com.rvz.serviceeverz.notification.ProblemNotificationService;
import com.rvz.serviceeverz.repository.KnownErrorRecordRepository;
import com.rvz.serviceeverz.repository.ProblemCategoryRepository;
import com.rvz.serviceeverz.repository.ProblemIncidentLinkRepository;
import com.rvz.serviceeverz.repository.ProblemRepository;
import com.rvz.serviceeverz.repository.ProblemSubCategoryRepository;

@Service
public class ProblemServiceImpl implements ProblemService {
 
    private static final Logger log = LoggerFactory.getLogger(ProblemServiceImpl.class);
 
    private final ProblemRepository             problemRepo;
    private final ProblemCategoryRepository     categoryRepo;
    private final ProblemSubCategoryRepository  subCategoryRepo;
    private final ProblemIncidentLinkRepository linkRepo;
    private final KnownErrorRecordRepository    kerRepo;
    private final IncidentFeignClient           incidentClient;
    private final UserFeignClient               userClient;
    private final ProblemNotificationService    notifService;
 
    public ProblemServiceImpl(ProblemRepository problemRepo,
                              ProblemCategoryRepository categoryRepo,
                              ProblemSubCategoryRepository subCategoryRepo,
                              ProblemIncidentLinkRepository linkRepo,
                              KnownErrorRecordRepository kerRepo,
                              IncidentFeignClient incidentClient,
                              UserFeignClient userClient,
                              ProblemNotificationService notifService) {
        this.problemRepo     = problemRepo;
        this.categoryRepo    = categoryRepo;
        this.subCategoryRepo = subCategoryRepo;
        this.linkRepo        = linkRepo;
        this.kerRepo         = kerRepo;
        this.incidentClient  = incidentClient;
        this.userClient      = userClient;
        this.notifService    = notifService;
    }
 
    // ── Helpers ──────────────────────────────────────────────────
 
    private String resolveName(Long userId) {
        if (userId == null) return null;
        try {
            var resp = userClient.getUserName(userId);
            return (resp != null && resp.getData() != null) ? resp.getData() : "User #" + userId;
        } catch (Exception e) {
            log.warn("Could not resolve name for userId={}: {}", userId, e.getMessage());
            return "User #" + userId;
        }
    }
 
    private String resolveIncidentTitle(Long incidentId) {
        try {
            var resp = incidentClient.getIncidentTitle(incidentId);
            return (resp != null && resp.getData() != null) ? resp.getData() : "Incident #" + incidentId;
        } catch (Exception e) {
            log.warn("Could not resolve title for incidentId={}: {}", incidentId, e.getMessage());
            return "Incident #" + incidentId;
        }
    }
    private Long resolveManagerId(Long userId) {
        if (userId == null) return null;
        try {
            var response = userClient.getManagerId(userId);
            if (response != null && response.getData() != null) {
                return response.getData();
            }
            log.warn("Manager ID not found for userId={}", userId);
            return null;
        } catch (Exception e) {
            log.error("Failed to resolve managerId for userId={}: {}", userId, e.getMessage());
            return null;
        }
    }
     
    private ProblemResponse toResponse(Problem p) {
        ProblemResponse r = new ProblemResponse();
        r.setId(p.getId());
        r.setProblemNumber(p.getProblemNumber());
        r.setTitle(p.getTitle());
        r.setDescription(p.getDescription());
        r.setStatus(p.getStatus());
        r.setPriority(p.getPriority());
        r.setImpact(p.getImpact());
        r.setCiName(p.getCiName());
        r.setCreatedBySpId(p.getCreatedBySpId());
        r.setCreatedBySpName(resolveName(p.getCreatedBySpId()));
        r.setManagerId(p.getManagerId());
        r.setManagerName(resolveName(p.getManagerId()));
        if (p.getCategory() != null) {
            r.setCategoryId(p.getCategory().getId());
            r.setCategoryName(p.getCategory().getName());
        }
        if (p.getSubCategory() != null) {
            r.setSubCategoryId(p.getSubCategory().getId());
            r.setSubCategoryName(p.getSubCategory().getName());
        }
        r.setRootCause(p.getRootCause());
        r.setWorkaround(p.getWorkaround());
        r.setWorkaroundProvidedAt(p.getWorkaroundProvidedAt());
        r.setPermanentFix(p.getPermanentFix());
        r.setPermanentFixAppliedAt(p.getPermanentFixAppliedAt());
        r.setHasKnownErrorRecord(p.getHasKnownErrorRecord());
        r.setClosedAt(p.getClosedAt());
        r.setCreatedAt(p.getCreatedAt());
        r.setUpdatedAt(p.getUpdatedAt());
        List<ProblemResponse.LinkedIncidentDto> links = linkRepo.findAllByProblemId(p.getId())
            .stream().map(l -> {
                ProblemResponse.LinkedIncidentDto dto = new ProblemResponse.LinkedIncidentDto();
                dto.setLinkId(l.getId());
                dto.setIncidentId(l.getIncidentId());
                dto.setIncidentTitle(l.getIncidentTitle());
                dto.setNotes(l.getNotes());
                dto.setLinkedAt(l.getLinkedAt());
                return dto;
            }).collect(Collectors.toList());
        r.setLinkedIncidents(links);
        return r;
    }
 
    private KnownErrorRecordResponse toKerResponse(KnownErrorRecord ker) {
        KnownErrorRecordResponse r = new KnownErrorRecordResponse();
        r.setId(ker.getId());
        r.setKerNumber(ker.getKerNumber());
        r.setProblemId(ker.getProblem().getId());
        r.setProblemNumber(ker.getProblem().getProblemNumber());
        r.setTitle(ker.getTitle());
        r.setSymptoms(ker.getSymptoms());
        r.setRootCause(ker.getRootCause());
        r.setWorkaround(ker.getWorkaround());
        r.setPermanentFix(ker.getPermanentFix());
        r.setAffectedCi(ker.getAffectedCi());
        r.setCreatedBySpId(ker.getCreatedBySpId());
        r.setCreatedBySpName(resolveName(ker.getCreatedBySpId()));
        r.setIsActive(ker.getIsActive());
        r.setCreatedAt(ker.getCreatedAt());
        r.setUpdatedAt(ker.getUpdatedAt());
        return r;
    }
 
    // ── Problem Lifecycle ─────────────────────────────────────────
 
    @Override
    @Transactional
    public ProblemResponse createProblem(CreateProblemRequest request) {
        ProblemCategory category = categoryRepo.findById(request.getCategoryId())
            .orElseThrow(() -> new ProblemNotFoundException(
                "Category not found: " + request.getCategoryId()));
     
        // fetch manager ID from user service using SP's userId
//        Long managerId = resolveManagerId(request.getCreatedBySpId());
//        if (managerId == null) {
//            throw new IllegalStateException(
//                "Could not resolve manager for SP userId=" + request.getCreatedBySpId()
//                + ". Ensure the user has an active project with l1ManagerId assigned.");
//        }
     
        Problem p = new Problem();
        p.setProblemNumber("PRB-TEMP-" + System.nanoTime());
        p.setTitle(request.getTitle());
        p.setDescription(request.getDescription());
        p.setPriority(request.getPriority());
        p.setImpact(request.getImpact());
        p.setCategory(category);
        p.setCiName(request.getCiName());
        p.setCreatedBySpId(request.getCreatedBySpId());
        p.setManagerId(null);   // set from user service
        p.setStatus(ProblemStatus.LOGGED);
     
        if (request.getSubCategoryId() != null) {
            subCategoryRepo.findById(request.getSubCategoryId())
                .ifPresent(p::setSubCategory);
        }
     
        p = problemRepo.save(p);
        p.setProblemNumber(String.format("PRB-%06d", p.getId()));
        p = problemRepo.save(p);
     
        // auto-link triggering incident
        if (request.getTriggeringIncidentId() != null) {
            String title = resolveIncidentTitle(request.getTriggeringIncidentId());
            ProblemIncidentLink link = new ProblemIncidentLink();
            link.setProblem(p);
            link.setIncidentId(request.getTriggeringIncidentId());
            link.setIncidentTitle(title);
            link.setLinkedBySpId(request.getCreatedBySpId());
            link.setNotes("Auto-linked as triggering incident during problem creation");
            linkRepo.save(link);
        }
     
        log.info("Problem {} created with managerId={} auto-resolved from user service",
            p.getProblemNumber(),null);
        notifService.notifyManagerProblemCreated(p);
        return toResponse(p);
    }
     
    @Override
    @Transactional
    public ProblemResponse linkIncident(Long problemId, LinkIncidentRequest request) {
        Problem p = problemRepo.findById(problemId)
            .orElseThrow(() -> new ProblemNotFoundException("Problem not found: " + problemId));
 
        if (linkRepo.existsByProblemIdAndIncidentId(problemId, request.getIncidentId()))
            throw new IllegalStateException("Incident " + request.getIncidentId()
                + " is already linked to this problem.");
 
        String title = resolveIncidentTitle(request.getIncidentId());
        ProblemIncidentLink link = new ProblemIncidentLink();
        link.setProblem(p);
        link.setIncidentId(request.getIncidentId());
        link.setIncidentTitle(title);
        link.setLinkedBySpId(request.getLinkedBySpId());
        link.setNotes(request.getNotes());
        linkRepo.save(link);
 
        if (p.getStatus() == ProblemStatus.LOGGED) {
            p.setStatus(ProblemStatus.UNDER_INVESTIGATION);
            p = problemRepo.save(p);
        }
 
        try {
            incidentClient.updateIncidentStatus(request.getIncidentId(), "IN_PROGRESS");
            log.info("Incident {} moved to IN_PROGRESS after problem link", request.getIncidentId());
        } catch (Exception e) {
            log.warn("Could not update incident {} status: {}", request.getIncidentId(), e.getMessage());
        }
 
        log.info("Incident {} linked to problem {}", request.getIncidentId(), p.getProblemNumber());
        return toResponse(p);
    }
 
    @Override
    @Transactional
    public ProblemResponse submitRca(Long problemId, RcaRequest request) {
        Problem p = problemRepo.findById(problemId)
            .orElseThrow(() -> new ProblemNotFoundException("Problem not found: " + problemId));
 
        if (p.getStatus() == ProblemStatus.RESOLVED || p.getStatus() == ProblemStatus.CLOSED)
            throw new IllegalStateException("Cannot update a resolved/closed problem.");
 
        p.setRootCause(request.getRootCause());
        p.setStatus(ProblemStatus.RCA_IN_PROGRESS);
        p = problemRepo.save(p);
        log.info("RCA submitted for problem {}", p.getProblemNumber());
        return toResponse(p);
    }
 
    @Override
    @Transactional
    public ProblemResponse provideWorkaround(Long problemId, WorkaroundRequest request) {
        Problem p = problemRepo.findById(problemId)
            .orElseThrow(() -> new ProblemNotFoundException("Problem not found: " + problemId));
 
        if (p.getStatus() == ProblemStatus.RESOLVED || p.getStatus() == ProblemStatus.CLOSED)
            throw new IllegalStateException("Cannot update a resolved/closed problem.");
 
        p.setWorkaround(request.getWorkaround());
        p.setWorkaroundProvidedAt(LocalDateTime.now());
        p.setStatus(ProblemStatus.WORKAROUND_PROVIDED);
        p = problemRepo.save(p);
        log.info("Workaround provided for problem {}", p.getProblemNumber());
        notifService.notifyManagerWorkaroundProvided(p);
        return toResponse(p);
    }
    @Override
    @Transactional
    public ProblemResponse applyPermanentFix(Long problemId, PermanentFixRequest request) {
        Problem p = problemRepo.findById(problemId)
            .orElseThrow(() -> new ProblemNotFoundException("Problem not found: " + problemId));
 
        if (p.getStatus() == ProblemStatus.RESOLVED || p.getStatus() == ProblemStatus.CLOSED)
            throw new IllegalStateException("Problem is already resolved/closed.");
 
        p.setPermanentFix(request.getPermanentFix());
        p.setPermanentFixAppliedAt(LocalDateTime.now());
        p.setStatus(ProblemStatus.PERMANENT_FIX_IN_PROGRESS);
        p.setHasKnownErrorRecord(true);
        p = problemRepo.save(p);
 
        KnownErrorRecord ker = kerRepo.findByProblemId(problemId).orElse(new KnownErrorRecord());
        boolean isNew = ker.getId() == null;
        ker.setProblem(p);
        ker.setTitle(p.getTitle());
        ker.setSymptoms(request.getSymptoms() != null ? request.getSymptoms() : p.getDescription());
        ker.setRootCause(p.getRootCause());
        ker.setWorkaround(p.getWorkaround());
        ker.setPermanentFix(request.getPermanentFix());
        ker.setAffectedCi(p.getCiName());
        ker.setCreatedBySpId(request.getSpId());
        ker.setIsActive(true);
        ker = kerRepo.save(ker);
 
        if (isNew) {
            ker.setKerNumber(String.format("KER-%06d", ker.getId()));
            ker = kerRepo.save(ker);
        }
 
        p.setStatus(ProblemStatus.KNOWN_ERROR);
        problemRepo.save(p);
 
        List<ProblemIncidentLink> links = linkRepo.findAllByProblemId(problemId);
        for (ProblemIncidentLink l : links) {
            try {
                incidentClient.updateIncidentStatus(l.getIncidentId(), "RESOLVED");
                log.info("Incident {} moved to RESOLVED after permanent fix", l.getIncidentId());
            } catch (Exception e) {
                log.warn("Could not resolve incident {}: {}", l.getIncidentId(), e.getMessage());
            }
        }
 
        log.info("Permanent fix + KEDB {} created for problem {}", ker.getKerNumber(), p.getProblemNumber());
        notifService.notifyManagerPermanentFixFound(p, ker);
        return toResponse(p);
    }
    @Override
    @Transactional
    public ProblemResponse closeProblem(Long problemId, Long closedBySpId) {
        Problem p = problemRepo.findById(problemId)
            .orElseThrow(() -> new ProblemNotFoundException("Problem not found: " + problemId));
 
        if (p.getStatus() == ProblemStatus.CLOSED)
            throw new IllegalStateException("Problem is already closed.");
 
        p.setStatus(ProblemStatus.CLOSED);
        p.setClosedAt(LocalDateTime.now());
        p = problemRepo.save(p);
        log.info("Problem {} closed", p.getProblemNumber());
        notifService.notifyManagerProblemClosed(p);
        return toResponse(p);
    }
    @Override
    public ProblemResponse getProblemById(Long id) {
        return toResponse(problemRepo.findById(id)
            .orElseThrow(() -> new ProblemNotFoundException("Problem not found: " + id)));
    }
 
    @Override
    public ProblemResponse getProblemByNumber(String problemNumber) {
        return toResponse(problemRepo.findByProblemNumber(problemNumber)
            .orElseThrow(() -> new ProblemNotFoundException("Problem not found: " + problemNumber)));
    }
 
    @Override
    public List<ProblemResponse> getAllProblems() {
        return problemRepo.findAllByOrderByCreatedAtDesc()
            .stream().map(this::toResponse).collect(Collectors.toList());
    }
 
    @Override
    public List<ProblemResponse> getProblemsByStatus(ProblemStatus status) {
        return problemRepo.findAllByStatus(status)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }
 
    @Override
    public List<ProblemResponse> getProblemsByPriority(ProblemPriority priority) {
        return problemRepo.findAllByPriority(priority)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }
 
    @Override
    public List<ProblemResponse> getProblemsBySp(Long spId) {
        return problemRepo.findAllByCreatedBySpId(spId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }
 
    @Override
    public List<ProblemResponse> getProblemsByManager(Long managerId) {
        return problemRepo.findAllByManagerId(managerId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }
 
    @Override
    public List<ProblemResponse> searchProblems(String keyword) {
        if (keyword == null || keyword.isBlank()) return getAllProblems();
        return problemRepo.searchByKeyword(keyword.trim())
            .stream().map(this::toResponse).collect(Collectors.toList());
    }
    @Override
    public KnownErrorRecordResponse getKerByProblemId(Long problemId) {
        return toKerResponse(kerRepo.findByProblemId(problemId)
            .orElseThrow(() -> new ProblemNotFoundException("No KEDB record for problem: " + problemId)));
    }
 
    @Override
    public List<KnownErrorRecordResponse> getAllKerRecords() {
        return kerRepo.findAllByOrderByCreatedAtDesc()
            .stream().map(this::toKerResponse).collect(Collectors.toList());
    }
 
    @Override
    public List<KnownErrorRecordResponse> searchKedb(String keyword) {
        if (keyword == null || keyword.isBlank()) return getAllKerRecords();
        return kerRepo.searchKedb(keyword.trim())
            .stream().map(this::toKerResponse).collect(Collectors.toList());
    }}