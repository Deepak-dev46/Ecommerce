// package com.relevantz.ticketservice.service.impl;

// import java.time.LocalDateTime;
// import java.util.List;
// import java.util.Map;
// import java.util.concurrent.ThreadLocalRandom;
// import java.util.stream.Collectors;

// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import com.relevantz.ticketservice.client.ApprovalClient;
// import com.relevantz.ticketservice.client.MailClient;
// import com.relevantz.ticketservice.client.MasterDataClient;
// import com.relevantz.ticketservice.client.RmoClient;
// import com.relevantz.ticketservice.client.ServiceCatalogClient;
// import com.relevantz.ticketservice.client.UserServiceClient;
// import com.relevantz.ticketservice.dto.CreateTicketRequest;
// import com.relevantz.ticketservice.dto.EmailRequest;
// import com.relevantz.ticketservice.dto.InitiateApprovalRequest;
// import com.relevantz.ticketservice.dto.QueueResponse;
// import com.relevantz.ticketservice.dto.SubmitTicketRequest;
// import com.relevantz.ticketservice.dto.TicketResponse;
// import com.relevantz.ticketservice.model.ApprovalLevel;
// import com.relevantz.ticketservice.model.ApprovalStatus;
// import com.relevantz.ticketservice.model.Priority;
// import com.relevantz.ticketservice.model.Ticket;
// import com.relevantz.ticketservice.model.TicketAttachments;
// import com.relevantz.ticketservice.model.TicketHistory;
// import com.relevantz.ticketservice.model.TicketMode;
// import com.relevantz.ticketservice.model.TicketQueue;
// import com.relevantz.ticketservice.model.TicketStatus;
// import com.relevantz.ticketservice.repository.TicketAttachmentRepository;
// import com.relevantz.ticketservice.repository.TicketHistoryRepository;
// import com.relevantz.ticketservice.repository.TicketQueueRepository;
// import com.relevantz.ticketservice.repository.TicketRepository;
// import com.relevantz.ticketservice.service.OurTicketService;

// @Service
// @Transactional
// public class OurTicketServiceImpl implements OurTicketService {

// 	private static final Logger log = LoggerFactory.getLogger(OurTicketServiceImpl.class);
// 	private static final String FALLBACK_EMAIL = "user@company.com";

// 	private final TicketRepository ticketRepo;
// 	private final TicketQueueRepository queueRepo;
// 	private final TicketHistoryRepository historyRepo;
// 	private final TicketAttachmentRepository attachmentRepo;
// 	private final MasterDataClient masterClient;
// 	private final RmoClient rmoClient;
// 	private final ApprovalClient approvalClient;
// 	private final MailClient mailClient;
// 	private final UserServiceClient userServiceClient;
// 	private final ServiceCatalogClient catalogClient;

// 	public OurTicketServiceImpl(TicketRepository ticketRepo, TicketQueueRepository queueRepo,
// 			TicketHistoryRepository historyRepo, TicketAttachmentRepository attachmentRepo,
// 			MasterDataClient masterClient, RmoClient rmoClient, ApprovalClient approvalClient, MailClient mailClient,
// 			UserServiceClient userServiceClient, ServiceCatalogClient catalogClient) {
// 		this.ticketRepo = ticketRepo;
// 		this.queueRepo = queueRepo;
// 		this.historyRepo = historyRepo;
// 		this.attachmentRepo = attachmentRepo;
// 		this.masterClient = masterClient;
// 		this.rmoClient = rmoClient;
// 		this.approvalClient = approvalClient;
// 		this.mailClient = mailClient;
// 		this.userServiceClient = userServiceClient;
// 		this.catalogClient = catalogClient;
// 	}

// 	/*
// 	 * ========================================================= SAVE DRAFT
// 	 * =========================================================
// 	 */
// 	@Override
// 	public TicketResponse saveDraft(CreateTicketRequest req) {
// 		Ticket ticket = buildTicket(req);
// 		ticket.setStatus(TicketStatus.OPEN);
// 		ticket.setDraft(true);
// 		enrichCatalogNames(ticket);
// 		Ticket saved = ticketRepo.save(ticket);
// 		saveAttachment(saved.getTicketId(), req);
// 		history(saved, "Draft saved");
// 		return toResponse(saved);
// 	}

// 	/*
// 	 * ========================================================= CREATE AND SUBMIT
// 	 * =========================================================
// 	 */
// 	@Override
// 	public TicketResponse createAndSubmit(CreateTicketRequest req) {
// 		Ticket ticket = buildTicket(req);
// 		ticket.setStatus(TicketStatus.OPEN);
// 		ticket.setDraft(false);
// 		enrichCatalogNames(ticket);
// 		Ticket saved = ticketRepo.save(ticket);

// 		saveAttachment(saved.getTicketId(), req);
// 		createQueue(saved);
// 		triggerApproval(saved);

// 		String email = resolveEmail(saved.getUserId());
// 		sendEmail(email, "Ticket Submitted — " + saved.getTicketNumber(),
// 				"Dear " + saved.getRequesterName() + ",\n\n" + "Your ticket " + saved.getTicketNumber()
// 						+ " has been submitted.\n" + "Subject: " + saved.getSubject() + "\n\n"
// 						+ "Pending L1 approval.\n\nServiceEverZ Team");

// 		history(saved, "Submitted — pending L1 approval");
// 		return toResponse(saved);
// 	}

// 	/*
// 	 * ========================================================= SUBMIT DRAFT
// 	 * =========================================================
// 	 */
// 	@Override
// 	public TicketResponse submitDraft(SubmitTicketRequest req) {
// 		Ticket ticket = ticketRepo.findById(req.getTicketId())
// 				.orElseThrow(() -> new RuntimeException("Ticket not found: " + req.getTicketId()));
// 		ticket.setStatus(TicketStatus.OPEN);
// 		ticket.setDraft(false);
// 		ticket.setUpdatedAt(LocalDateTime.now());
// 		Ticket saved = ticketRepo.save(ticket);

// 		createQueue(saved);
// 		triggerApproval(saved);

// 		String email = resolveEmail(saved.getUserId());
// 		sendEmail(email, "Draft Submitted — " + saved.getTicketNumber(),
// 				"Dear " + saved.getRequesterName() + ",\n\nYour draft ticket " + saved.getTicketNumber()
// 						+ " has been submitted — pending L1 approval.\n\nServiceEverZ Team");

// 		history(saved, "Draft submitted — pending L1 approval");
// 		return toResponse(saved);
// 	}

// 	/*
// 	 * ========================================================= GET TICKETS BY USER
// 	 * =========================================================
// 	 */
// 	@Override
// 	@Transactional(readOnly = true)
// 	public List<TicketResponse> getTicketsByUser(Long userId) {
// 		return ticketRepo.findByUserIdOrderByUpdatedAtDesc(userId).stream().map(t -> {
// 			TicketResponse r = toResponse(t);
// 			List<TicketQueue> queue = queueRepo.findByTicketId(t.getTicketId());
// 			r.setQueue(queue.stream().map(QueueResponse::from).toList());
// 			// Full approval detail fetched per-ticket via getTicketById (approval-service)
// 			r.setApprovals(List.of());
// 			return r;
// 		}).collect(Collectors.toList());
// 	}

// 	/*
// 	 * ========================================================= PRIVATE: Enrich
// 	 * category/subcategory/item names from service-catalog
// 	 * =========================================================
// 	 */
// 	private void enrichCatalogNames(Ticket t) {
// 		// Category name
// 		if ((t.getCategoryName() == null || t.getCategoryName().isBlank()) && t.getCategoryId() != null) {
// 			try {
// 				Map<String, Object> cat = catalogClient.getCategoryById(t.getCategoryId());
// 				String name = strMapVal(cat, "name");
// 				if (name != null) {
// 					t.setCategoryName(name);
// 				}
// 			} catch (Exception e) {
// 				log.warn("Could not fetch category name for id={}: {}", t.getCategoryId(), e.getMessage());
// 			}
// 		}

// 		// SubCategory name
// 		if ((t.getSubCategoryName() == null || t.getSubCategoryName().isBlank()) && t.getSubCategoryId() != null) {
// 			try {
// 				Map<String, Object> sub = catalogClient.getSubcategoryById(t.getSubCategoryId());
// 				String name = strMapVal(sub, "name");
// 				if (name != null) {
// 					t.setSubCategoryName(name);
// 				}
// 			} catch (Exception e) {
// 				log.warn("Could not fetch subcategory name for id={}: {}", t.getSubCategoryId(), e.getMessage());
// 			}
// 		}

// 		// Item name
// 		if ((t.getItemName() == null || t.getItemName().isBlank()) && t.getItemId() != null) {
// 			try {
// 				Map<String, Object> item = catalogClient.getServiceById(t.getItemId());
// 				String name = strMapVal(item, "name");
// 				if (name != null) {
// 					t.setItemName(name);
// 				}
// 			} catch (Exception e) {
// 				log.warn("Could not fetch item name for id={}: {}", t.getItemId(), e.getMessage());
// 			}
// 		}
// 	}

// 	/*
// 	 * ========================================================= PRIVATE: Build
// 	 * Ticket entity from request
// 	 * =========================================================
// 	 */
// 	private Ticket buildTicket(CreateTicketRequest req) {
// 		Ticket t = new Ticket();
// 		t.setTicketNumber("INC-" + System.currentTimeMillis() + "-" + ThreadLocalRandom.current().nextInt(100, 999));

// 		Long requesterId = req.getEffectiveRequesterId();
// 		t.setUserId(requesterId);
// 		t.setRequesterName(req.getEffectiveRequesterName());
// 		t.setCreatedBy(requesterId);
// 		t.setUpdatedBy(requesterId);

// 		t.setTypeId(req.getTypeId());
// 		t.setTypeName(req.getTypeName());
// 		t.setCategoryId(req.getCategoryId() != null ? req.getCategoryId().longValue() : null);
// 		t.setCategoryName(req.getCategory()); // may be null if frontend only sent ID
// 		t.setSubCategoryId(req.getSubCategoryId() != null ? req.getSubCategoryId().longValue() : null);
// 		t.setSubCategoryName(req.getSubCategory());
// 		t.setItemId(req.getItemId() != null ? req.getItemId().longValue() : null);
// 		t.setItemName(req.getItem());
// 		t.setPriorityId(req.getPriorityId() != null ? req.getPriorityId().longValue() : null);

// 		t.setPriority(req.getEffectivePriority());
// 		t.setSubject(req.getSubject());
// 		t.setDescription(req.getDescription());
// 		t.setLocation(req.getLocation());
// 		t.setMobileNumber(req.getMobileNumber());
// 		t.setProjectId(req.getProjectId());
// 		t.setAssetId(req.getAssetId());
// 		t.setMode(TicketMode.PORTAL);

// 		// boolean isOthers = req.getItem() != null && req.getItem().trim().equalsIgnoreCase("others");
// 		// t.setRequiresResourceApproval(isOthers);
// 		String itemLabel = req.getItem() != null ? req.getItem().trim().toLowerCase() : "";
// 		boolean isOthers = itemLabel.equals("others") || itemLabel.startsWith("others") || itemLabel.contains("other");
// 		t.setRequiresResourceApproval(isOthers);
// 		log.info("Ticket item='{}', requiresResourceApproval={}", req.getItem(), isOthers);

// 		LocalDateTime now = LocalDateTime.now();
// 		t.setSlaStartTime(now);
// 		t.setSlaDeadline(now.plusHours(slaHours(t.getPriority())));
// 		t.setSlaBreached(false);
// 		t.setAllowUserReply(false);

// 		return t;
// 	}

// 	/*
// 	 * ========================================================= PRIVATE: Save
// 	 * attachment =========================================================
// 	 */
// 	private void saveAttachment(Long ticketId, CreateTicketRequest req) {
// 		if (req.getAttachmentName() == null || req.getAttachmentName().isBlank()) {
// 			return;
// 		}
// 		TicketAttachments a = new TicketAttachments();
// 		a.setTicketId(ticketId);
// 		a.setFilename(req.getAttachmentName());
// 		a.setFile(req.getAttachmentName());
// 		attachmentRepo.save(a);
// 	}

// 	/*
// 	 * ========================================================= PRIVATE: Create L1
// 	 * + L2 queue entries =========================================================
// 	 */
// 	private void createQueue(Ticket ticket) {
// 		if (!queueRepo.findByTicketId(ticket.getTicketId()).isEmpty()) {
// 			return;
// 		}

// 		// Fetch real L1/L2 manager IDs and names from RMO service
// 		String l1Name = "L1 Approver";
// 		String l2Name = "L2 Approver";
// 		Long l1Id = null;
// 		Long l2Id = null;
// 		Long roId = null;
// 		if (ticket.getProjectId() != null) {
// 			try {
// 				// RMO returns ProjectResponse directly (no ApiResponse wrapper)
// 				Map<String, Object> proj = rmoClient.getProjectById(ticket.getProjectId());
// 				if (proj != null) {
// 					l1Id = toLong(proj.get("l1ManagerId"));
// 					l2Id = toLong(proj.get("l2ManagerId"));
// 					roId = toLong(proj.get("resourceOwnerId"));
// 					log.warn("[RMO] projectId={} -> l1ManagerId={}, l2ManagerId={}, resourceOwnerId={}",
// 							ticket.getProjectId(), l1Id, l2Id, roId);
// 					if (l1Id != null) {
// 						String n = resolveUserName(l1Id);
// 						log.warn("[RMO] l1 resolvedName={}", n);
// 						if (n != null) {
// 							l1Name = n;

// 						}
// 					}
// 					if (l2Id != null) {
// 						String n = resolveUserName(l2Id);
// 						log.warn("[RMO] l2 resolvedName={}", n);
// 						if (n != null) {
// 							l2Name = n;

// 						}
// 					}
// 				}
// 			} catch (Exception e) {
// 				log.warn("Could not fetch project managers from RMO: {}", e.getMessage());
// 			}
// 		}

// 		TicketQueue l1 = new TicketQueue();
// 		l1.setTicketId(ticket.getTicketId());
// 		l1.setApprovalLevel(ApprovalLevel.L1);
// 		l1.setStatus(ApprovalStatus.PENDING);
// 		l1.setApproverName(l1Name);
// 		if (l1Id != null) {
// 			l1.setApproverId(l1Id);
// 		}
// 		queueRepo.save(l1);

// 		TicketQueue l2 = new TicketQueue();
// 		l2.setTicketId(ticket.getTicketId());
// 		l2.setApprovalLevel(ApprovalLevel.L2);
// 		l2.setStatus(ApprovalStatus.PENDING);
// 		l2.setApproverName(l2Name);
// 		if (l2Id != null) {
// 			l2.setApproverId(l2Id);
// 		}
// 		queueRepo.save(l2);

// 		if (Boolean.TRUE.equals(ticket.getRequiresResourceApproval())) {
// 			String roName = "Resource Owner";
// 			if (roId != null) {
// 				String n = resolveUserName(roId);
// 				if (n != null) {
// 					roName = n;

// 				}
// 			}
// 			TicketQueue ro = new TicketQueue();
// 			ro.setTicketId(ticket.getTicketId());
// 			ro.setApprovalLevel(ApprovalLevel.RESOURCE_OWNER);
// 			ro.setStatus(ApprovalStatus.PENDING);
// 			ro.setApproverName(roName);
// 			if (roId != null) {
// 				ro.setApproverId(roId);
// 			}
// 			queueRepo.save(ro);
// 		}
// 	}

// 	/*
// 	 * ========================================================= PRIVATE: Trigger
// 	 * approval-service =========================================================
// 	 */
// 	@SuppressWarnings("unchecked")
// 	private void triggerApproval(Ticket ticket) {
// 		try {
// 			InitiateApprovalRequest req = new InitiateApprovalRequest();
// 			req.setTicketId(ticket.getTicketId());
// 			req.setProjectId(ticket.getProjectId());
// 			req.setCategoryId(ticket.getCategoryId() != null ? ticket.getCategoryId().intValue() : 1);
// 			req.setSubCategoryId(ticket.getSubCategoryId() != null ? ticket.getSubCategoryId().intValue() : 1);
// 			req.setRequiresResourceApproval(Boolean.TRUE.equals(ticket.getRequiresResourceApproval()));
// 			req.setRequesterName(ticket.getRequesterName());
// 			req.setRequesterEmail(resolveEmail(ticket.getUserId()));
// 			req.setTicketSubject(ticket.getSubject());
// 			req.setTicketNumber(ticket.getTicketNumber());

// 			// Fetch real L1/L2/RO details from RMO
// 			if (ticket.getProjectId() != null) {
// 				try {
// 					Map<String, Object> proj = rmoClient.getProjectById(ticket.getProjectId());
// 					if (proj != null) {
// 						Long l1Id = toLong(proj.get("l1ManagerId"));
// 						Long l2Id = toLong(proj.get("l2ManagerId"));
// 						Long roId = toLong(proj.get("resourceOwnerId"));
// 						log.warn("[APPROVAL] projectId={} -> l1={}, l2={}, ro={}", ticket.getProjectId(), l1Id, l2Id,
// 								roId);
// 						log.warn("[APPROVAL] l1Name={}, l2Name={}", resolveUserName(l1Id), resolveUserName(l2Id));

// 						req.setL1ApproverId(l1Id != null ? l1Id.toString() : "");
// 						req.setL1ApproverName(l1Id != null ? nvl(resolveUserName(l1Id), "L1 Approver") : "L1 Approver");
// 						req.setL1ApproverEmail(l1Id != null ? nvl(resolveEmail(l1Id), "") : "");

// 						req.setL2ApproverId(l2Id != null ? l2Id.toString() : "");
// 						req.setL2ApproverName(l2Id != null ? nvl(resolveUserName(l2Id), "L2 Approver") : "L2 Approver");
// 						req.setL2ApproverEmail(l2Id != null ? nvl(resolveEmail(l2Id), "") : "");

// 						if (Boolean.TRUE.equals(ticket.getRequiresResourceApproval())) {
// 							req.setResourceOwnerId(roId != null ? roId.toString() : "");
// 							req.setResourceOwnerName(
// 									roId != null ? nvl(resolveUserName(roId), "Resource Owner") : "Resource Owner");
// 							req.setResourceOwnerEmail(roId != null ? nvl(resolveEmail(roId), "") : "");
// 						}
// 					}
// 				} catch (Exception ex) {
// 					log.warn("Could not fetch RMO project details for approval trigger, ticket={}: {}",
// 							ticket.getTicketId(), ex.getMessage());
// 					req.setL1ApproverId("");
// 					req.setL1ApproverName("L1 Approver");
// 					req.setL1ApproverEmail("");
// 					req.setL2ApproverId("");
// 					req.setL2ApproverName("L2 Approver");
// 					req.setL2ApproverEmail("");
// 				}
// 			} else {
// 				req.setL1ApproverId("");
// 				req.setL1ApproverName("L1 Approver");
// 				req.setL1ApproverEmail("");
// 				req.setL2ApproverId("");
// 				req.setL2ApproverName("L2 Approver");
// 				req.setL2ApproverEmail("");
// 			}

// 			Object result = approvalClient.initiateApproval(req);

// 			if (result instanceof Map<?, ?> respMap) {
// 				Object dataObj = respMap.get("data");
// 				if (dataObj instanceof Map<?, ?> data) {
// 					updateQueueNames(ticket.getTicketId(), strVal(data, "l1ApproverName"),
// 							strVal(data, "l2ApproverName"), strVal(data, "l1ApproverId"), strVal(data, "l2ApproverId"));
// 				}
// 			}
// 		} catch (Exception ex) {
// 			log.warn("Approval trigger failed for ticket={}: {}", ticket.getTicketId(), ex.getMessage());
// 		}
// 	}

// 	private void updateQueueNames(Long ticketId, String l1Name, String l2Name, String l1IdStr, String l2IdStr) {
// 		if (l1Name == null && l2Name == null) {
// 			return;
// 		}
// 		List<TicketQueue> queue = queueRepo.findByTicketId(ticketId);
// 		for (TicketQueue q : queue) {
// 			if (q.getApprovalLevel() == ApprovalLevel.L1 && l1Name != null && !l1Name.isBlank()) {
// 				q.setApproverName(l1Name);
// 				if (l1IdStr != null && !l1IdStr.isBlank()) {
// 					try {
// 						q.setApproverId(Long.parseLong(l1IdStr));
// 					} catch (Exception ignored) {
// 					}
// 				}
// 			} else if (q.getApprovalLevel() == ApprovalLevel.L2 && l2Name != null && !l2Name.isBlank()) {
// 				q.setApproverName(l2Name);
// 				if (l2IdStr != null && !l2IdStr.isBlank()) {
// 					try {
// 						q.setApproverId(Long.parseLong(l2IdStr));
// 					} catch (Exception ignored) {
// 					}
// 				}
// 			}
// 			queueRepo.save(q);
// 		}
// 	}

// 	/*
// 	 * ========================================================= PRIVATE helpers
// 	 * =========================================================
// 	 */
// 	private TicketResponse toResponse(Ticket t) {
// 		List<TicketQueue> q = queueRepo.findByTicketId(t.getTicketId());
// 		return TicketResponse.from(t, List.of(), List.of(), q, q, null);
// 	}

// 	private void history(Ticket t, String msg) {
// 		TicketHistory h = new TicketHistory();
// 		h.setTicketId(t.getTicketId());
// 		h.setStatus(t.getStatus());
// 		h.setRemarks(msg);
// 		h.setChangedBy(0L);
// 		h.setChangedByName("System");
// 		historyRepo.save(h);
// 	}

// 	@SuppressWarnings("unchecked")
// 	private String resolveEmail(Long userId) {
// 		if (userId == null) {
// 			return FALLBACK_EMAIL;
// 		}

// 		// Try RMO user endpoint first — same DB as L1/L2 managers

// 		try {
// 			Map<String, Object> body = userServiceClient.getUserById(userId);
// 			if (body != null) {
// 				Object email = body.get("email");
// 				if (email instanceof String s && !s.isBlank()) {
// 					return s;
// 				}
// 			}
// 		} catch (Exception ex) {
// 			log.warn("user-service email lookup failed for userId={}: {}", userId, ex.getMessage());
// 		}

// 		return FALLBACK_EMAIL;
// 	}

// 	@SuppressWarnings("unchecked")
// 	private String resolveUserName(Long userId) {
// 		if (userId == null) {
// 			return null;
// 		}

// 		// Try RMO user endpoint first — L1/L2 managers are registered in the same DB
// 		try {
// 			Map<String, Object> body = userServiceClient.getUserById(userId);
// 			if (body != null) {
// 				String first = strMapVal(body, "firstName");
// 				String last = strMapVal(body, "lastName");
// 				if (first != null || last != null) {
// 					return ((first != null ? first : "") + " " + (last != null ? last : "")).trim();
// 				}
// 				String full = strMapVal(body, "fullName");
// 				if (full != null) {
// 					return full;
// 				}
// 			}
// 		} catch (Exception e) {
// 			log.warn("user-service name lookup failed for userId={}: {}", userId, e.getMessage());
// 		}

// 		return null;
// 	}

// 	@SuppressWarnings("unchecked")
// 	private Map<String, Object> extractData(Map<String, Object> resp) {
// 		if (resp == null) {
// 			return null;
// 		}
// 		if (resp.get("data") instanceof Map) {
// 			return (Map<String, Object>) resp.get("data");
// 		}
// 		return resp;
// 	}

// 	private String strMapVal(Map<?, ?> m, String key) {
// 		if (m == null) {
// 			return null;
// 		}
// 		Object v = m.get(key);
// 		return v instanceof String s && !s.isBlank() ? s : null;
// 	}

// 	private void sendEmail(String to, String subject, String body) {
// 		try {
// 			mailClient.sendEmail(new EmailRequest(to, subject, body, false));
// 		} catch (Exception ex) {
// 			log.warn("Mail failed to {}: {}", to, ex.getMessage());
// 		}
// 	}

// 	private String strVal(Map<?, ?> m, String k) {
// 		Object v = m.get(k);
// 		return v instanceof String s ? s : null;
// 	}

// 	private Long toLong(Object o) {
// 		if (o == null) {
// 			return null;
// 		}
// 		if (o instanceof Number n) {
// 			return n.longValue();
// 		}
// 		try {
// 			return Long.parseLong(o.toString());
// 		} catch (Exception e) {
// 			return null;
// 		}
// 	}

// 	private String nvl(String value, String fallback) {
// 		return (value != null && !value.isBlank()) ? value : fallback;
// 	}

// 	private int slaHours(Priority p) {
// 		return switch (p) {
// 		case HIGH -> 8;
// 		case LOW -> 72;
// 		default -> 24;
// 		};
// 	}

// 	@Override
// 	public TicketResponse updateDraft(Long ticketId, CreateTicketRequest req) {
// 		Ticket ticket = ticketRepo.findById(ticketId)
// 				.orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));
// 		if (!Boolean.TRUE.equals(ticket.getDraft())) {
// 			throw new RuntimeException("Only DRAFT tickets can be updated this way");
// 		}

// 		// Update only the fields the user can change — never touch SLA or status
// 		if (req.getProjectId() != null)
// 			ticket.setProjectId(req.getProjectId());
// 		if (req.getCategoryId() != null)
// 			ticket.setCategoryId(req.getCategoryId().longValue());
// 		if (req.getCategory() != null)
// 			ticket.setCategoryName(req.getCategory());
// 		if (req.getSubCategoryId() != null)
// 			ticket.setSubCategoryId(req.getSubCategoryId().longValue());
// 		if (req.getSubCategory() != null)
// 			ticket.setSubCategoryName(req.getSubCategory());
// 		if (req.getItemId() != null)
// 			ticket.setItemId(req.getItemId().longValue());
// 		if (req.getItem() != null)
// 			ticket.setItemName(req.getItem());
// 		if (req.getPriorityId() != null)
// 			ticket.setPriorityId(req.getPriorityId().longValue());
// 		if (req.getEffectivePriority() != null)
// 			ticket.setPriority(req.getEffectivePriority());
// 		if (req.getAssetId() != null)
// 			ticket.setAssetId(req.getAssetId());
// 		if (req.getSubject() != null)
// 			ticket.setSubject(req.getSubject());
// 		if (req.getDescription() != null)
// 			ticket.setDescription(req.getDescription());
// 		if (req.getLocation() != null)
// 			ticket.setLocation(req.getLocation());

// 		String mob = req.getMobileNumber();
// 		if (mob != null && mob.matches("^[6-9][0-9]{9}$"))
// 			ticket.setMobileNumber(mob);

// 		// Recalculate requiresResourceApproval based on updated item
// 		String itemName = ticket.getItemName() != null ? ticket.getItemName().trim().toLowerCase() : "";
// 		ticket.setRequiresResourceApproval(
// 				itemName.equals("others") || itemName.startsWith("other") || itemName.contains("others"));

// 		// Fix SLA fields if they are null from original save (prevent constraint
// 		// errors)
// 		if (ticket.getSlaStartTime() == null)
// 			ticket.setSlaStartTime(LocalDateTime.now());
// 		if (ticket.getSlaDeadline() == null) {
// 			Priority p = ticket.getPriority();
// 			int hrs = (p == Priority.HIGH) ? 8 : (p == Priority.LOW) ? 72 : 24;
// 			ticket.setSlaDeadline(ticket.getSlaStartTime().plusHours(hrs));
// 		}
// 		if (ticket.getSlaBreached() == null)
// 			ticket.setSlaBreached(false);
// //        if (ticket.getAllowUserReply() == null)
// //            ticket.setAllowUserReply(false);
// 		if (ticket.getRequiresResourceApproval() == null)
// 			ticket.setRequiresResourceApproval(false);
// 		if (ticket.getMode() == null)
// 			ticket.setMode(TicketMode.PORTAL);

// 		ticket.setUpdatedAt(LocalDateTime.now());

// 		try {
// 			Ticket saved = ticketRepo.save(ticket);
// 			history(saved, "Draft updated");
// 			return toResponse(saved);
// 		} catch (Exception ex) {
// 			log.error("updateDraft failed for ticketId={}: {}", ticketId, ex.getMessage(), ex);
// 			throw new RuntimeException("Failed to update draft: " + ex.getMessage());
// 		}
// 	}

// 	// =========================================================

// 	// RESOLVE TICKET — support stores resolution + emails user

// 	// =========================================================

// 	@Override

// 	public TicketResponse resolveTicket(Long ticketId, String resolutionMessage, Long supportPersonId) {

// 		Ticket ticket = ticketRepo.findById(ticketId)

// 				.orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));

// 		// Store resolution message in the ticket row

// 		ticket.setResolutionNotes(resolutionMessage);

// 		ticket.setStatus(TicketStatus.PENDING_USER_ACK);

// 		ticket.setUpdatedAt(LocalDateTime.now());

// 		Ticket saved = ticketRepo.save(ticket);

// 		// Record in history

// 		history(saved, "Resolved by support — awaiting user acknowledgement");

// 		// Email the requester

// 		String requesterEmail = resolveEmail(saved.getUserId());

// 		String requesterName = saved.getRequesterName() != null ? saved.getRequesterName() : "User";

// 		sendEmail(requesterEmail,

// 				"Your Ticket Has Been Resolved — " + saved.getTicketNumber(),

// 				"Dear " + requesterName + ",\n\n"

// 						+ "Your support ticket " + saved.getTicketNumber() + " has been resolved.\n\n"

// 						+ "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"

// 						+ "RESOLUTION MESSAGE:\n"

// 						+ resolutionMessage + "\n"

// 						+ "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"

// 						+ "Please log in to ServiceEverZ to acknowledge this resolution.\n"

// 						+ "If the issue persists, you may reopen the ticket.\n\n"

// 						+ "Thank you,\nServiceEverZ Support Team");

// 		log.info("Ticket {} resolved by supportPersonId={}. Status=PENDING_USER_ACK", ticketId, supportPersonId);

// 		return toResponse(saved);

// 	}

// 	// =========================================================

// 	// USER ACKNOWLEDGE — user confirms resolution, emails support

// 	// =========================================================

// 	@Override

// 	public TicketResponse userAcknowledge(Long ticketId, Long userId) {

// 		Ticket ticket = ticketRepo.findById(ticketId)

// 				.orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));

// 		if (ticket.getStatus() != TicketStatus.PENDING_USER_ACK) {

// 			throw new RuntimeException("Ticket is not pending user acknowledgement");

// 		}

// 		ticket.setStatus(TicketStatus.RESOLVED);

// 		ticket.setUpdatedAt(LocalDateTime.now());

// 		Ticket saved = ticketRepo.save(ticket);

// 		// Record in history

// 		history(saved, "User acknowledged the resolution");

// 		// Email the assignee (support person) to notify they can close

// 		if (saved.getAssigneeId() != null) {

// 			String supportEmail = resolveEmail(saved.getAssigneeId());

// 			String supportName = saved.getAssigneeName() != null ? saved.getAssigneeName() : "Support Personnel";

// 			sendEmail(supportEmail,

// 					"User Acknowledged — Ticket " + saved.getTicketNumber() + " Ready to Close",

// 					"Hello " + supportName + ",\n\n"

// 							+ "The end user has acknowledged your resolution for ticket "

// 							+ saved.getTicketNumber() + ".\n\n"

// 							+ "You may now close the ticket from your Support Dashboard.\n\n"

// 							+ "ServiceEverZ System");

// 			log.info("Assignee {} notified of user acknowledgement for ticket {}", supportEmail, ticketId);

// 		}

// 		log.info("Ticket {} acknowledged by userId={}. Status=RESOLVED", ticketId, userId);

// 		return toResponse(saved);

// 	}

// }


package com.relevantz.ticketservice.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.relevantz.ticketservice.client.ApprovalClient;
import com.relevantz.ticketservice.client.MailClient;
import com.relevantz.ticketservice.client.MasterDataClient;
import com.relevantz.ticketservice.client.RmoClient;
import com.relevantz.ticketservice.client.ServiceCatalogClient;
import com.relevantz.ticketservice.client.UserServiceClient;
import com.relevantz.ticketservice.dto.CreateTicketRequest;
import com.relevantz.ticketservice.dto.EmailRequest;
import com.relevantz.ticketservice.dto.InitiateApprovalRequest;
import com.relevantz.ticketservice.dto.QueueResponse;
import com.relevantz.ticketservice.dto.SubmitTicketRequest;
import com.relevantz.ticketservice.dto.TicketResponse;
import com.relevantz.ticketservice.exception.ResourceNotFoundException;
import com.relevantz.ticketservice.model.ApprovalLevel;
import com.relevantz.ticketservice.model.ApprovalStatus;
import com.relevantz.ticketservice.model.Priority;
import com.relevantz.ticketservice.model.Ticket;
import com.relevantz.ticketservice.model.TicketAttachments;
import com.relevantz.ticketservice.model.TicketHistory;
import com.relevantz.ticketservice.model.TicketMode;
import com.relevantz.ticketservice.model.TicketQueue;
import com.relevantz.ticketservice.model.TicketStatus;
import com.relevantz.ticketservice.repository.TicketAccessPeriodRepository;
import com.relevantz.ticketservice.repository.TicketAttachmentRepository;
import com.relevantz.ticketservice.repository.TicketHistoryRepository;
import com.relevantz.ticketservice.repository.TicketQueueRepository;
import com.relevantz.ticketservice.repository.TicketRepository;
import com.relevantz.ticketservice.service.OurTicketService;

@Service
@Transactional
public class OurTicketServiceImpl implements OurTicketService {

	private static final Logger log = LoggerFactory.getLogger(OurTicketServiceImpl.class);
	private static final String FALLBACK_EMAIL = "user@company.com";

	private final TicketRepository ticketRepo;
	private final TicketQueueRepository queueRepo;
	private final TicketHistoryRepository historyRepo;
	private final TicketAttachmentRepository attachmentRepo;
	private final MasterDataClient masterClient;
	private final RmoClient rmoClient;
	private final ApprovalClient approvalClient;
	private final MailClient mailClient;
	private final UserServiceClient userServiceClient;
	private final ServiceCatalogClient catalogClient;
    private final TicketAccessPeriodRepository accessPeriodRepo;

	public OurTicketServiceImpl(TicketRepository ticketRepo, TicketQueueRepository queueRepo,
			TicketHistoryRepository historyRepo, TicketAttachmentRepository attachmentRepo,
			MasterDataClient masterClient, RmoClient rmoClient, ApprovalClient approvalClient, MailClient mailClient,
			UserServiceClient userServiceClient, ServiceCatalogClient catalogClient,TicketAccessPeriodRepository accessPeriodRepo) {
		this.ticketRepo = ticketRepo;
		this.queueRepo = queueRepo;
		this.historyRepo = historyRepo;
		this.attachmentRepo = attachmentRepo;
		this.masterClient = masterClient;
		this.rmoClient = rmoClient;
		this.approvalClient = approvalClient;
		this.mailClient = mailClient;
		this.userServiceClient = userServiceClient;
		this.catalogClient = catalogClient;
		this.accessPeriodRepo=accessPeriodRepo;
	}

	/*
	 * ========================================================= SAVE DRAFT
	 * =========================================================
	 */
	@Override
	public TicketResponse saveDraft(CreateTicketRequest req) {
		Ticket ticket = buildTicket(req);
		ticket.setStatus(TicketStatus.OPEN);
		ticket.setDraft(true);
		enrichCatalogNames(ticket);
		Ticket saved = ticketRepo.save(ticket);
		saveAttachment(saved.getTicketId(), req);
		saveAccessPeriod(saved.getTicketId(),req);
		history(saved, "Draft saved");
		return toResponse(saved);
	}

	/*
	 * ========================================================= CREATE AND SUBMIT
	 * =========================================================
	 */
	@Override
	public TicketResponse createAndSubmit(CreateTicketRequest req) {
		Ticket ticket = buildTicket(req);
		ticket.setStatus(TicketStatus.OPEN);
		ticket.setDraft(false);
		enrichCatalogNames(ticket);
		Ticket saved = ticketRepo.save(ticket);

		saveAttachment(saved.getTicketId(), req);
		saveAccessPeriod(saved.getTicketId(),req);
		createQueue(saved);
		triggerApproval(saved);

		String email = resolveEmail(saved.getUserId());
		sendEmail(email, "Ticket Submitted — " + saved.getTicketNumber(),
				"Dear " + saved.getRequesterName() + ",\n\n" + "Your ticket " + saved.getTicketNumber()
						+ " has been submitted.\n" + "Subject: " + saved.getSubject() + "\n\n"
						+ "Pending L1 approval.\n\nServiceEverZ Team");

		history(saved, "Submitted — pending L1 approval");
		return toResponse(saved);
	}

	/*
	 * ========================================================= SUBMIT DRAFT
	 * =========================================================
	 */
	@Override
	public TicketResponse submitDraft(SubmitTicketRequest req) {
		Ticket ticket = ticketRepo.findById(req.getTicketId())
				.orElseThrow(() -> new RuntimeException("Ticket not found: " + req.getTicketId()));
		ticket.setStatus(TicketStatus.OPEN);
		ticket.setDraft(false);
		ticket.setUpdatedAt(LocalDateTime.now());
		Ticket saved = ticketRepo.save(ticket);

		createQueue(saved);
		triggerApproval(saved);

		String email = resolveEmail(saved.getUserId());
		sendEmail(email, "Draft Submitted — " + saved.getTicketNumber(),
				"Dear " + saved.getRequesterName() + ",\n\nYour draft ticket " + saved.getTicketNumber()
						+ " has been submitted — pending L1 approval.\n\nServiceEverZ Team");

		history(saved, "Draft submitted — pending L1 approval");
		return toResponse(saved);
	}

	/*
	 * ========================================================= GET TICKETS BY USER
	 * =========================================================
	 */
	@Override
	@Transactional(readOnly = true)
	public List<TicketResponse> getTicketsByUser(Long userId) {
		return ticketRepo.findByUserIdOrderByUpdatedAtDesc(userId).stream().map(t -> {
			TicketResponse r = toResponse(t);
			List<TicketQueue> queue = queueRepo.findByTicketId(t.getTicketId());
			r.setQueue(queue.stream().map(QueueResponse::from).toList());
			// Full approval detail fetched per-ticket via getTicketById (approval-service)
			r.setApprovals(List.of());
			return r;
		}).collect(Collectors.toList());
	}

	/*
	 * ========================================================= PRIVATE: Enrich
	 * category/subcategory/item names from service-catalog
	 * =========================================================
	 */
	private void enrichCatalogNames(Ticket t) {
		// Category name
		if ((t.getCategoryName() == null || t.getCategoryName().isBlank()) && t.getCategoryId() != null) {
			try {
				Map<String, Object> cat = catalogClient.getCategoryById(t.getCategoryId());
				String name = strMapVal(cat, "name");
				if (name != null) {
					t.setCategoryName(name);
				}
			} catch (Exception e) {
				log.warn("Could not fetch category name for id={}: {}", t.getCategoryId(), e.getMessage());
			}
		}

		// SubCategory name
		if ((t.getSubCategoryName() == null || t.getSubCategoryName().isBlank()) && t.getSubCategoryId() != null) {
			try {
				Map<String, Object> sub = catalogClient.getSubcategoryById(t.getSubCategoryId());
				String name = strMapVal(sub, "name");
				if (name != null) {
					t.setSubCategoryName(name);
				}
			} catch (Exception e) {
				log.warn("Could not fetch subcategory name for id={}: {}", t.getSubCategoryId(), e.getMessage());
			}
		}

		// Item name
		if ((t.getItemName() == null || t.getItemName().isBlank()) && t.getItemId() != null) {
			try {
				Map<String, Object> item = catalogClient.getServiceById(t.getItemId());
				String name = strMapVal(item, "name");
				if (name != null) {
					t.setItemName(name);
				}
			} catch (Exception e) {
				log.warn("Could not fetch item name for id={}: {}", t.getItemId(), e.getMessage());
			}
		}
	}

	/*
	 * ========================================================= PRIVATE: Build
	 * Ticket entity from request
	 * =========================================================
	 */
	private Ticket buildTicket(CreateTicketRequest req) {
		Ticket t = new Ticket();
		t.setTicketNumber("INC-" + System.currentTimeMillis() + "-" + ThreadLocalRandom.current().nextInt(100, 999));

		Long requesterId = req.getEffectiveRequesterId();
		t.setUserId(requesterId);
		t.setRequesterName(req.getEffectiveRequesterName());
		t.setCreatedBy(requesterId);
		t.setUpdatedBy(requesterId);

		t.setTypeId(req.getTypeId());
		t.setTypeName(req.getTypeName());
		t.setCategoryId(req.getCategoryId() != null ? req.getCategoryId().longValue() : null);
		t.setCategoryName(req.getCategory()); // may be null if frontend only sent ID
		t.setSubCategoryId(req.getSubCategoryId() != null ? req.getSubCategoryId().longValue() : null);
		t.setSubCategoryName(req.getSubCategory());
		t.setItemId(req.getItemId() != null ? req.getItemId().longValue() : null);
		t.setItemName(req.getItem());
		t.setPriorityId(req.getPriorityId() != null ? req.getPriorityId().longValue() : null);

		t.setPriority(req.getEffectivePriority());
		t.setSubject(req.getSubject());
		t.setDescription(req.getDescription());
		t.setLocation(req.getLocation());
		t.setMobileNumber(req.getMobileNumber());
		t.setProjectId(req.getProjectId());
		t.setAssetId(req.getAssetId());
		t.setMode(TicketMode.PORTAL);

		// boolean isOthers = req.getItem() != null && req.getItem().trim().equalsIgnoreCase("others");
		// t.setRequiresResourceApproval(isOthers);
		String itemLabel = req.getItem() != null ? req.getItem().trim().toLowerCase() : "";
		boolean isOthers = itemLabel.equals("others") || itemLabel.startsWith("others") || itemLabel.contains("other");
		t.setRequiresResourceApproval(isOthers);
		log.info("Ticket item='{}', requiresResourceApproval={}", req.getItem(), isOthers);

		LocalDateTime now = LocalDateTime.now();
		t.setSlaStartTime(now);
		t.setSlaDeadline(now.plusHours(slaHours(t.getPriority())));
		t.setSlaBreached(false);
		t.setAllowUserReply(false);

		return t;
	}

	/*
	 * ========================================================= PRIVATE: Save
	 * attachment =========================================================
	 */
//	private void saveAttachment(Long ticketId, CreateTicketRequest req) {
//		if (req.getAttachmentName() == null || req.getAttachmentName().isBlank()) {
//			return;
//		}
//		TicketAttachments a = new TicketAttachments();
//		a.setTicketId(ticketId);
//		a.setFilename(req.getAttachmentName());
//		a.setFile(req.getAttachmentName());
//		attachmentRepo.save(a);
//	}
	private void saveAttachment(Long ticketId, CreateTicketRequest req) {
	    if (req.getAttachmentName() == null || req.getAttachmentName().isBlank()) {
	        return;
	    }
	    if (req.getAttachmentBase64() == null || req.getAttachmentBase64().isBlank()) {
	        return;
	    }
	    TicketAttachments a = new TicketAttachments();
	    a.setTicketId(ticketId);
	    a.setFilename(req.getAttachmentName());
	    a.setFile(req.getAttachmentBase64());
	    a.setMimeType(req.getAttachmentMimeType());
	    a.setFileSizeBytes(req.getAttachmentSizeBytes());
	    attachmentRepo.save(a);
	}
	 
    private void saveAccessPeriod(Long ticketId, CreateTicketRequest req) {
    if (req.getAccessRequiredTill() == null) {
        return;
    }
    com.relevantz.ticketservice.model.TicketAccessPeriod ap =
        accessPeriodRepo.findByTicketId(ticketId).orElse(
            new com.relevantz.ticketservice.model.TicketAccessPeriod()
        );
    ap.setTicketId(ticketId);
    ap.setAccessRequiredTill(req.getAccessRequiredTill());
    accessPeriodRepo.save(ap);
    }
    
	/*
	 * ========================================================= PRIVATE: Create L1
	 * + L2 queue entries =========================================================
	 */
	private void createQueue(Ticket ticket) {
		if (!queueRepo.findByTicketId(ticket.getTicketId()).isEmpty()) {
			return;
		}

		// Fetch real L1/L2 manager IDs and names from RMO service
		String l1Name = "L1 Approver";
		String l2Name = "L2 Approver";
		Long l1Id = null;
		Long l2Id = null;
		Long roId = null;
		if (ticket.getProjectId() != null) {
			try {
				// RMO returns ProjectResponse directly (no ApiResponse wrapper)
				Map<String, Object> proj = rmoClient.getProjectById(ticket.getProjectId());
				if (proj != null) {
					l1Id = toLong(proj.get("l1ManagerId"));
					l2Id = toLong(proj.get("l2ManagerId"));
					roId = toLong(proj.get("resourceOwnerId"));
					log.warn("[RMO] projectId={} -> l1ManagerId={}, l2ManagerId={}, resourceOwnerId={}",
							ticket.getProjectId(), l1Id, l2Id, roId);
					if (l1Id != null) {
						String n = resolveUserName(l1Id);
						log.warn("[RMO] l1 resolvedName={}", n);
						if (n != null) {
							l1Name = n;

						}
					}
					if (l2Id != null) {
						String n = resolveUserName(l2Id);
						log.warn("[RMO] l2 resolvedName={}", n);
						if (n != null) {
							l2Name = n;

						}
					}
				}
			} catch (Exception e) {
				log.warn("Could not fetch project managers from RMO: {}", e.getMessage());
			}
		}

		TicketQueue l1 = new TicketQueue();
		l1.setTicketId(ticket.getTicketId());
		l1.setApprovalLevel(ApprovalLevel.L1);
		l1.setStatus(ApprovalStatus.PENDING);
		l1.setApproverName(l1Name);
		if (l1Id != null) {
			l1.setApproverId(l1Id);
		}
		queueRepo.save(l1);

		TicketQueue l2 = new TicketQueue();
		l2.setTicketId(ticket.getTicketId());
		l2.setApprovalLevel(ApprovalLevel.L2);
		l2.setStatus(ApprovalStatus.PENDING);
		l2.setApproverName(l2Name);
		if (l2Id != null) {
			l2.setApproverId(l2Id);
		}
		queueRepo.save(l2);

		if (Boolean.TRUE.equals(ticket.getRequiresResourceApproval())) {
			String roName = "Resource Owner";
			if (roId != null) {
				String n = resolveUserName(roId);
				if (n != null) {
					roName = n;

				}
			}
			TicketQueue ro = new TicketQueue();
			ro.setTicketId(ticket.getTicketId());
			ro.setApprovalLevel(ApprovalLevel.RESOURCE_OWNER);
			ro.setStatus(ApprovalStatus.PENDING);
			ro.setApproverName(roName);
			if (roId != null) {
				ro.setApproverId(roId);
			}
			queueRepo.save(ro);
		}
	}

	/*
	 * ========================================================= PRIVATE: Trigger
	 * approval-service =========================================================
	 */
	@SuppressWarnings("unchecked")
	private void triggerApproval(Ticket ticket) {
		try {
			InitiateApprovalRequest req = new InitiateApprovalRequest();
			req.setTicketId(ticket.getTicketId());
			req.setProjectId(ticket.getProjectId());
			req.setCategoryId(ticket.getCategoryId() != null ? ticket.getCategoryId().intValue() : 1);
			req.setSubCategoryId(ticket.getSubCategoryId() != null ? ticket.getSubCategoryId().intValue() : 1);
			req.setRequiresResourceApproval(Boolean.TRUE.equals(ticket.getRequiresResourceApproval()));
			req.setRequesterName(ticket.getRequesterName());
			req.setRequesterEmail(resolveEmail(ticket.getUserId()));
			req.setTicketSubject(ticket.getSubject());
			req.setTicketNumber(ticket.getTicketNumber());

			// Fetch real L1/L2/RO details from RMO
			if (ticket.getProjectId() != null) {
				try {
					Map<String, Object> proj = rmoClient.getProjectById(ticket.getProjectId());
					if (proj != null) {
						Long l1Id = toLong(proj.get("l1ManagerId"));
						Long l2Id = toLong(proj.get("l2ManagerId"));
						Long roId = toLong(proj.get("resourceOwnerId"));
						log.warn("[APPROVAL] projectId={} -> l1={}, l2={}, ro={}", ticket.getProjectId(), l1Id, l2Id,
								roId);
						log.warn("[APPROVAL] l1Name={}, l2Name={}", resolveUserName(l1Id), resolveUserName(l2Id));

						req.setL1ApproverId(l1Id != null ? l1Id.toString() : "");
						req.setL1ApproverName(l1Id != null ? nvl(resolveUserName(l1Id), "L1 Approver") : "L1 Approver");
						req.setL1ApproverEmail(l1Id != null ? nvl(resolveEmail(l1Id), "") : "");

						req.setL2ApproverId(l2Id != null ? l2Id.toString() : "");
						req.setL2ApproverName(l2Id != null ? nvl(resolveUserName(l2Id), "L2 Approver") : "L2 Approver");
						req.setL2ApproverEmail(l2Id != null ? nvl(resolveEmail(l2Id), "") : "");

						if (Boolean.TRUE.equals(ticket.getRequiresResourceApproval())) {
							req.setResourceOwnerId(roId != null ? roId.toString() : "");
							req.setResourceOwnerName(
									roId != null ? nvl(resolveUserName(roId), "Resource Owner") : "Resource Owner");
							req.setResourceOwnerEmail(roId != null ? nvl(resolveEmail(roId), "") : "");
						}
					}
				} catch (Exception ex) {
					log.warn("Could not fetch RMO project details for approval trigger, ticket={}: {}",
							ticket.getTicketId(), ex.getMessage());
					req.setL1ApproverId("");
					req.setL1ApproverName("L1 Approver");
					req.setL1ApproverEmail("");
					req.setL2ApproverId("");
					req.setL2ApproverName("L2 Approver");
					req.setL2ApproverEmail("");
				}
			} else {
				req.setL1ApproverId("");
				req.setL1ApproverName("L1 Approver");
				req.setL1ApproverEmail("");
				req.setL2ApproverId("");
				req.setL2ApproverName("L2 Approver");
				req.setL2ApproverEmail("");
			}

			Object result = approvalClient.initiateApproval(req);

			if (result instanceof Map<?, ?> respMap) {
				Object dataObj = respMap.get("data");
				if (dataObj instanceof Map<?, ?> data) {
					updateQueueNames(ticket.getTicketId(), strVal(data, "l1ApproverName"),
							strVal(data, "l2ApproverName"), strVal(data, "l1ApproverId"), strVal(data, "l2ApproverId"));
				}
			}
		} catch (Exception ex) {
			log.warn("Approval trigger failed for ticket={}: {}", ticket.getTicketId(), ex.getMessage());
		}
	}

	private void updateQueueNames(Long ticketId, String l1Name, String l2Name, String l1IdStr, String l2IdStr) {
		if (l1Name == null && l2Name == null) {
			return;
		}
		List<TicketQueue> queue = queueRepo.findByTicketId(ticketId);
		for (TicketQueue q : queue) {
			if (q.getApprovalLevel() == ApprovalLevel.L1 && l1Name != null && !l1Name.isBlank()) {
				q.setApproverName(l1Name);
				if (l1IdStr != null && !l1IdStr.isBlank()) {
					try {
						q.setApproverId(Long.parseLong(l1IdStr));
					} catch (Exception ignored) {
					}
				}
			} else if (q.getApprovalLevel() == ApprovalLevel.L2 && l2Name != null && !l2Name.isBlank()) {
				q.setApproverName(l2Name);
				if (l2IdStr != null && !l2IdStr.isBlank()) {
					try {
						q.setApproverId(Long.parseLong(l2IdStr));
					} catch (Exception ignored) {
					}
				}
			}
			queueRepo.save(q);
		}
	}

	/*
	 * ========================================================= PRIVATE helpers
	 * =========================================================
	 */
	// private TicketResponse toResponse(Ticket t) {
	// 	List<TicketQueue> q = queueRepo.findByTicketId(t.getTicketId());
	// 	return TicketResponse.from(t, List.of(), List.of(), q, q, null);
	// }
	// private TicketResponse toResponse(Ticket t) {
    // List<TicketQueue> q = queueRepo.findByTicketId(t.getTicketId());
    // TicketResponse r = TicketResponse.from(t, List.of(), List.of(), q, q, null);
    // accessPeriodRepo.findByTicketId(t.getTicketId()).ifPresent(ap ->
    //     r.setAccessRequiredTill(ap.getAccessRequiredTill())
    // );
    // return r;
    // }
  
   private TicketResponse toResponse(Ticket t) {
    List<TicketQueue> q = queueRepo.findByTicketId(t.getTicketId());
    TicketResponse r = TicketResponse.from(t, List.of(), List.of(), q, q, null);
    accessPeriodRepo.findByTicketId(t.getTicketId())
        .ifPresent(ap -> r.setAccessRequiredTill(ap.getAccessRequiredTill()));
    return r;
    }
   
	private void history(Ticket t, String msg) {
		TicketHistory h = new TicketHistory();
		h.setTicketId(t.getTicketId());
		h.setStatus(t.getStatus());
		h.setRemarks(msg);
		h.setChangedBy(0L);
		h.setChangedByName("System");
		historyRepo.save(h);
	}

	@SuppressWarnings("unchecked")
	private String resolveEmail(Long userId) {
		if (userId == null) {
			return FALLBACK_EMAIL;
		}

		// Try RMO user endpoint first — same DB as L1/L2 managers

		try {
			Map<String, Object> body = userServiceClient.getUserById(userId);
			if (body != null) {
				Object email = body.get("email");
				if (email instanceof String s && !s.isBlank()) {
					return s;
				}
			}
		} catch (Exception ex) {
			log.warn("user-service email lookup failed for userId={}: {}", userId, ex.getMessage());
		}

		return FALLBACK_EMAIL;
	}

	@SuppressWarnings("unchecked")
	private String resolveUserName(Long userId) {
		if (userId == null) {
			return null;
		}

		// Try RMO user endpoint first — L1/L2 managers are registered in the same DB
		try {
			Map<String, Object> body = userServiceClient.getUserById(userId);
			if (body != null) {
				String first = strMapVal(body, "firstName");
				String last = strMapVal(body, "lastName");
				if (first != null || last != null) {
					return ((first != null ? first : "") + " " + (last != null ? last : "")).trim();
				}
				String full = strMapVal(body, "fullName");
				if (full != null) {
					return full;
				}
			}
		} catch (Exception e) {
			log.warn("user-service name lookup failed for userId={}: {}", userId, e.getMessage());
		}

		return null;
	}

	@SuppressWarnings("unchecked")
	private Map<String, Object> extractData(Map<String, Object> resp) {
		if (resp == null) {
			return null;
		}
		if (resp.get("data") instanceof Map) {
			return (Map<String, Object>) resp.get("data");
		}
		return resp;
	}

	private String strMapVal(Map<?, ?> m, String key) {
		if (m == null) {
			return null;
		}
		Object v = m.get(key);
		return v instanceof String s && !s.isBlank() ? s : null;
	}

	private void sendEmail(String to, String subject, String body) {
		try {
			mailClient.sendEmail(new EmailRequest(to, subject, body, false));
		} catch (Exception ex) {
			log.warn("Mail failed to {}: {}", to, ex.getMessage());
		}
	}

	private String strVal(Map<?, ?> m, String k) {
		Object v = m.get(k);
		return v instanceof String s ? s : null;
	}

	private Long toLong(Object o) {
		if (o == null) {
			return null;
		}
		if (o instanceof Number n) {
			return n.longValue();
		}
		try {
			return Long.parseLong(o.toString());
		} catch (Exception e) {
			return null;
		}
	}

	private String nvl(String value, String fallback) {
		return (value != null && !value.isBlank()) ? value : fallback;
	}

	private int slaHours(Priority p) {
		return switch (p) {
		case HIGH -> 8;
		case LOW -> 72;
		default -> 24;
		};
	}

	@Override
	public TicketResponse updateDraft(Long ticketId, CreateTicketRequest req) {
		Ticket ticket = ticketRepo.findById(ticketId)
				.orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));
		if (!Boolean.TRUE.equals(ticket.getDraft())) {
			throw new RuntimeException("Only DRAFT tickets can be updated this way");
		}

		// Update only the fields the user can change — never touch SLA or status
		if (req.getProjectId() != null)
			ticket.setProjectId(req.getProjectId());
		if (req.getCategoryId() != null)
			ticket.setCategoryId(req.getCategoryId().longValue());
		if (req.getCategory() != null)
			ticket.setCategoryName(req.getCategory());
		if (req.getSubCategoryId() != null)
			ticket.setSubCategoryId(req.getSubCategoryId().longValue());
		if (req.getSubCategory() != null)
			ticket.setSubCategoryName(req.getSubCategory());
		if (req.getItemId() != null)
			ticket.setItemId(req.getItemId().longValue());
		if (req.getItem() != null)
			ticket.setItemName(req.getItem());
		if (req.getPriorityId() != null)
			ticket.setPriorityId(req.getPriorityId().longValue());
		if (req.getEffectivePriority() != null)
			ticket.setPriority(req.getEffectivePriority());
		if (req.getAssetId() != null)
			ticket.setAssetId(req.getAssetId());
		if (req.getSubject() != null)
			ticket.setSubject(req.getSubject());
		if (req.getDescription() != null)
			ticket.setDescription(req.getDescription());
		if (req.getLocation() != null)
			ticket.setLocation(req.getLocation());

		String mob = req.getMobileNumber();
		if (mob != null && mob.matches("^[6-9][0-9]{9}$"))
			ticket.setMobileNumber(mob);

		// Recalculate requiresResourceApproval based on updated item
		String itemName = ticket.getItemName() != null ? ticket.getItemName().trim().toLowerCase() : "";
		ticket.setRequiresResourceApproval(
				itemName.equals("others") || itemName.startsWith("other") || itemName.contains("others"));

		// Fix SLA fields if they are null from original save (prevent constraint
		// errors)
		if (ticket.getSlaStartTime() == null)
			ticket.setSlaStartTime(LocalDateTime.now());
		if (ticket.getSlaDeadline() == null) {
			Priority p = ticket.getPriority();
			int hrs = (p == Priority.HIGH) ? 8 : (p == Priority.LOW) ? 72 : 24;
			ticket.setSlaDeadline(ticket.getSlaStartTime().plusHours(hrs));
		}
		if (ticket.getSlaBreached() == null)
			ticket.setSlaBreached(false);
//        if (ticket.getAllowUserReply() == null)
//            ticket.setAllowUserReply(false);
		if (ticket.getRequiresResourceApproval() == null)
			ticket.setRequiresResourceApproval(false);
		if (ticket.getMode() == null)
			ticket.setMode(TicketMode.PORTAL);

		ticket.setUpdatedAt(LocalDateTime.now());

		try {
			Ticket saved = ticketRepo.save(ticket);
			history(saved, "Draft updated");
			return toResponse(saved);
		} catch (Exception ex) {
			log.error("updateDraft failed for ticketId={}: {}", ticketId, ex.getMessage(), ex);
			throw new RuntimeException("Failed to update draft: " + ex.getMessage());
		}
	}

	// =========================================================

	// RESOLVE TICKET — support stores resolution + emails user

	// =========================================================

	@Override

	public TicketResponse resolveTicket(Long ticketId, String resolutionMessage, Long supportPersonId) {
		Ticket ticket = ticketRepo.findById(ticketId)
	            .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));
	 
	    // ADD THIS GUARD
	    if (ticket.getStatus() == TicketStatus.RESOLVED
	            || ticket.getStatus() == TicketStatus.CLOSED
	            || ticket.getStatus() == TicketStatus.PENDING_USER_ACK) {
	        throw new RuntimeException("Ticket is already resolved or pending acknowledgement");
	    }
		ticket.setResolutionNotes(resolutionMessage);

		ticket.setStatus(TicketStatus.PENDING_USER_ACK);

		ticket.setUpdatedAt(LocalDateTime.now());

		Ticket saved = ticketRepo.save(ticket);

		// Record in history

		history(saved, "Resolved by support — awaiting user acknowledgement");

		// Email the requester

		String requesterEmail = resolveEmail(saved.getUserId());

		String requesterName = saved.getRequesterName() != null ? saved.getRequesterName() : "User";

		sendEmail(requesterEmail,

				"Your Ticket Has Been Resolved — " + saved.getTicketNumber(),

				"Dear " + requesterName + ",\n\n"

						+ "Your support ticket " + saved.getTicketNumber() + " has been resolved.\n\n"

						+ "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"

						+ "RESOLUTION MESSAGE:\n"

						+ resolutionMessage + "\n"

						+ "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"

						+ "Please log in to ServiceEverZ to acknowledge this resolution.\n"

						+ "If the issue persists, you may reopen the ticket.\n\n"

						+ "Thank you,\nServiceEverZ Support Team");

		log.info("Ticket {} resolved by supportPersonId={}. Status=PENDING_USER_ACK", ticketId, supportPersonId);

		return toResponse(saved);

	}

	// =========================================================

	// USER ACKNOWLEDGE — user confirms resolution, emails support

	// =========================================================

	@Override

	public TicketResponse userAcknowledge(Long ticketId, Long userId) {

		Ticket ticket = ticketRepo.findById(ticketId)

				.orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));

		if (ticket.getStatus() != TicketStatus.PENDING_USER_ACK) {

			throw new RuntimeException("Ticket is not pending user acknowledgement");

		}

		ticket.setStatus(TicketStatus.RESOLVED);

		ticket.setUpdatedAt(LocalDateTime.now());

		Ticket saved = ticketRepo.save(ticket);

		// Record in history

		history(saved, "User acknowledged the resolution");

		// Email the assignee (support person) to notify they can close

		if (saved.getAssigneeId() != null) {

			String supportEmail = resolveEmail(saved.getAssigneeId());

			String supportName = saved.getAssigneeName() != null ? saved.getAssigneeName() : "Support Personnel";

			sendEmail(supportEmail,

					"User Acknowledged — Ticket " + saved.getTicketNumber() + " Ready to Close",

					"Hello " + supportName + ",\n\n"

							+ "The end user has acknowledged your resolution for ticket "

							+ saved.getTicketNumber() + ".\n\n"

							+ "You may now close the ticket from your Support Dashboard.\n\n"

							+ "ServiceEverZ System");

			log.info("Assignee {} notified of user acknowledgement for ticket {}", supportEmail, ticketId);

		}

		log.info("Ticket {} acknowledged by userId={}. Status=RESOLVED", ticketId, userId);

		return toResponse(saved);

	}
	
	@Override
    public void deleteDraft(Long ticketId) {
        Ticket ticket = ticketRepo.findById(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));
        if (!Boolean.TRUE.equals(ticket.getDraft())) {
            throw new RuntimeException("Only DRAFT tickets can be deleted");
        }
        ticketRepo.deleteById(ticketId);
    }

}
