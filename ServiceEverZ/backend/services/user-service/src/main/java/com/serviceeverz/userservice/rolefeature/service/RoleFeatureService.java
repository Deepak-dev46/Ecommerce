package com.serviceeverz.userservice.rolefeature.service;
 
import com.serviceeverz.userservice.audit.entity.AuditLog;
import com.serviceeverz.userservice.audit.repository.AuditLogRepository;
import com.serviceeverz.userservice.rolefeature.dto.RoleFeatureDto;
import com.serviceeverz.userservice.rolefeature.dto.ToggleFeatureRequest;
import com.serviceeverz.userservice.rolefeature.entity.RoleFeatureConfig;
import com.serviceeverz.userservice.rolefeature.repository.RoleFeatureConfigRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.util.*;
import java.util.stream.Collectors;
 
@Service
public class RoleFeatureService {
 
    // ── Inner record replaces unsafe Object[] arrays ──────────────────────
    private record FeatureDef(
        String featureKey, String label, String description,
        String category, String roleName, String path, boolean defaultOn
    ) {}
 
    // ── Master feature registry ────────────────────────────────────────────
    private static final List<FeatureDef> FEATURE_REGISTRY = List.of(
        // ADMIN
        new FeatureDef("ADMIN_DASHBOARD", "Dashboard",       "Admin overview stats",            "Core",    "ADMIN",                "/dashboard",                        true),
        new FeatureDef("ADMIN_USERS",     "User management", "Create and manage users",          "Core",    "ADMIN",                "/users",                            true),
        new FeatureDef("ADMIN_ROLES",     "Role management", "Manage system roles",              "Core",    "ADMIN",                "/roles",                            true),
        new FeatureDef("ADMIN_PASSWORD",  "Password policy", "Password and security settings",   "Core",    "ADMIN",                "/password-policy",                  true),
        new FeatureDef("ADMIN_REPORTS",   "Reports",         "Download system reports",          "Reports", "ADMIN",                "/report",                           true),
        new FeatureDef("ADMIN_FEAT_CTRL", "Feature control", "Restrict features per role",       "Core",    "ADMIN",                "/feature-control",                  true),
        // RMO
        new FeatureDef("RMO_DASHBOARD",  "RMO Overview", "Resource overview dashboard",          "Core",      "RMO",                "/rmo/dashboard",                    true),
        new FeatureDef("RMO_PROJECTS",   "Projects",     "Manage projects",                      "Projects",  "RMO",                "/rmo/projects",                     true),
        new FeatureDef("RMO_RESOURCES",  "Resources",    "Assign employees to projects",         "Resources", "RMO",                "/rmo/resources",                    true),
        // ITSM_MANAGER
        new FeatureDef("ITSM_DASHBOARD",  "Dashboard",          "ITSM overview",                "Core",      "ITSM_MANAGER",       "/itsm/overview",                    true),
        new FeatureDef("ITSM_FEEDBACK",   "Feedback",           "CSAT feedback dashboard",       "Reports",   "ITSM_MANAGER",       "/itsm/dashboard",                   true),
        new FeatureDef("ITSM_TICKETS",    "All tickets",        "View and manage all tickets",   "Tickets",   "ITSM_MANAGER",       "/itsm/tickets",                     true),
        new FeatureDef("ITSM_ASSIGN",     "Manual assign",      "Assign tickets to agents",      "Tickets",   "ITSM_MANAGER",       "/itsm/assign",                      true),
        new FeatureDef("ITSM_MONITOR",    "Monitor tickets",    "Real-time ticket monitoring",   "Tickets",   "ITSM_MANAGER",       "/itsm/monitor",                     true),
        new FeatureDef("ITSM_CATALOG",    "Service catalog",    "Manage service catalog items",  "Catalog",   "ITSM_MANAGER",       "/itsm/manage/service-catalog",      true),
        new FeatureDef("ITSM_SLA",        "SLA management",     "Configure SLA policies",        "SLA",       "ITSM_MANAGER",       "/itsm/sla",                         true),
        new FeatureDef("ITSM_ASSETS",     "Asset management",   "Asset approval and tracking",   "Assets",    "ITSM_MANAGER",       "/itsm/asset-approval",              true),
        new FeatureDef("ITSM_PROBLEMS",   "Problem management", "Problem records and KEDB",      "Problems",  "ITSM_MANAGER",       "/itsm/problem-management",          true),
        new FeatureDef("ITSM_KB",         "Knowledge base",     "Create and manage KB articles", "Knowledge", "ITSM_MANAGER",       "/itsm/knowledgebase",               true),
        new FeatureDef("ITSM_RETENTION",  "Retention policies", "Data retention config",         "Config",    "ITSM_MANAGER",       "/itsm/retention",                   false),
        new FeatureDef("ITSM_CHANGE",     "Change management",  "Change requests and plans",     "Changes",   "ITSM_MANAGER",       "/itsm/changemanagement",            true),
        new FeatureDef("ITSM_REPORTS",    "Reports",            "ITSM analytics and reports",    "Reports",   "ITSM_MANAGER",       "/itsm/reports",                     true),
        // SUPPORT_PERSONNEL
        new FeatureDef("SUPPORT_DASHBOARD",   "Dashboard",        "Support overview",             "Core",      "SUPPORT_PERSONNEL",  "/support/dashboard",               true),
        new FeatureDef("SUPPORT_ACKNOWLEDGE", "Acknowledge",      "Acknowledge and pick tickets", "Tickets",   "SUPPORT_PERSONNEL",  "/support/acknowledge",             true),
        new FeatureDef("SUPPORT_TICKETS",     "My tickets",       "Assigned tickets",             "Tickets",   "SUPPORT_PERSONNEL",  "/support/tickets",                 true),
        new FeatureDef("SUPPORT_INCIDENTS",   "Incident tickets", "Incident management",          "Incidents", "SUPPORT_PERSONNEL",  "/support/incidents",               true),
        new FeatureDef("SUPPORT_ASSETS",      "Asset inventory",  "Asset tracking",               "Assets",    "SUPPORT_PERSONNEL",  "/support/asset-service",           true),
        new FeatureDef("SUPPORT_MAPPING",     "Asset mapping",    "Map assets to users/services", "Assets",    "SUPPORT_PERSONNEL",  "/support/asset-mappings",          true),
        new FeatureDef("SUPPORT_PROBLEMS",    "Problem records",  "Log and view problems",        "Problems",  "SUPPORT_PERSONNEL",  "/support/problem-records",         true),
        new FeatureDef("SUPPORT_KEDB",        "KEDB",             "Known error database",         "Problems",  "SUPPORT_PERSONNEL",  "/support/KEDB",                    true),
        new FeatureDef("SUPPORT_KB",          "Knowledge base",   "KB articles",                  "Knowledge", "SUPPORT_PERSONNEL",  "/support/knowledgebase",           true),
        new FeatureDef("SUPPORT_DUPLICATES",  "Duplicate review", "Review flagged duplicates",    "Quality",   "SUPPORT_PERSONNEL",  "/support/review/duplicates",       true),
        new FeatureDef("SUPPORT_BACKUP",      "Backup schedule",  "Backup schedule config",       "Config",    "SUPPORT_PERSONNEL",  "/support/backupschedule",          false),
        new FeatureDef("SUPPORT_CHANGE",      "Change plan",      "Change plan management",       "Changes",   "SUPPORT_PERSONNEL",  "/support/changeplan",              true),
        // APPROVAL_MANAGER_L1
        new FeatureDef("L1_QUEUE",   "Approval queue", "L1 approval queue",  "Core",    "APPROVAL_MANAGER_L1",  "/approvals/queue",           true),
        new FeatureDef("L1_HISTORY", "History",        "Past approvals",     "Reports", "APPROVAL_MANAGER_L1",  "/approvals/history",         true),
        new FeatureDef("L1_CATALOG", "Create ticket",  "Submit a request",   "Tickets", "APPROVAL_MANAGER_L1",  "/approvals/service-catalog", true),
        // APPROVAL_MANAGER_L2
        new FeatureDef("L2_QUEUE",   "Approval queue", "L2 approval queue",  "Core",    "APPROVAL_MANAGER_L2",  "/approvals/queue",           true),
        new FeatureDef("L2_HISTORY", "History",        "Past approvals",     "Reports", "APPROVAL_MANAGER_L2",  "/approvals/history",         true),
        new FeatureDef("L2_CATALOG", "Create ticket",  "Submit a request",   "Tickets", "APPROVAL_MANAGER_L2",  "/approvals/service-catalog", true),
        // RESOURCE_OWNER
        new FeatureDef("RO_PENDING", "Pending approvals", "Resource owner approvals", "Core",    "RESOURCE_OWNER", "/resource-owner/dashboard", true),
        new FeatureDef("RO_HISTORY", "History",           "Past resource approvals",  "Reports", "RESOURCE_OWNER", "/resource-owner/history",   true),
        // END_USER
        new FeatureDef("EU_DASHBOARD",     "Dashboard",     "User overview",              "Core",      "END_USER", "/user/dashboard",       true),
        new FeatureDef("EU_CREATE_TICKET", "Create ticket", "Submit a service request",   "Tickets",   "END_USER", "/user/service-catalog", true),
        new FeatureDef("EU_MY_TICKETS",    "My tickets",    "View submitted tickets",     "Tickets",   "END_USER", "/user/tickets",         true),
        new FeatureDef("EU_DRAFTS",        "Drafts",        "Saved draft tickets",        "Tickets",   "END_USER", "/user/drafts",          true),
        new FeatureDef("EU_KB",            "Knowledge base","Browse KB articles",         "Knowledge", "END_USER", "/user/knowledgebase",   true)
    );
 
    private final RoleFeatureConfigRepository repo;
    private final AuditLogRepository auditRepo;
 
    public RoleFeatureService(RoleFeatureConfigRepository repo, AuditLogRepository auditRepo) {
        this.repo = repo;
        this.auditRepo = auditRepo;
    }
 
    // ── GET features for one role ─────────────────────────────────────────
    public List<RoleFeatureDto> getFeaturesForRole(String roleName) {
        Map<String, Boolean> overrides = repo.findByRoleName(roleName).stream()
            .collect(Collectors.toMap(RoleFeatureConfig::getFeatureKey, RoleFeatureConfig::isEnabled));
 
        return FEATURE_REGISTRY.stream()
            .filter(f -> roleName.equalsIgnoreCase(f.roleName()))
            .map(f -> {
                boolean enabled = overrides.getOrDefault(f.featureKey(), f.defaultOn());
                return new RoleFeatureDto(
                    f.featureKey(), f.label(), f.description(),
                    f.category(), f.roleName(), f.path(),
                    enabled, f.defaultOn()
                );
            })
            .collect(Collectors.toList());
    }
 
    // ── GET all roles — fixes the 500 ─────────────────────────────────────
    public Map<String, List<RoleFeatureDto>> getAllRoleFeatures() {
        List<String> roles = List.of(
            "ADMIN", "RMO", "ITSM_MANAGER", "END_USER",
            "SUPPORT_PERSONNEL", "APPROVAL_MANAGER_L1",
            "APPROVAL_MANAGER_L2", "RESOURCE_OWNER"
        );
        Map<String, List<RoleFeatureDto>> result = new LinkedHashMap<>();
        for (String role : roles) {
            result.put(role, getFeaturesForRole(role));
        }
        return result;
    }
 
    // ── GET enabled keys (used at login) ──────────────────────────────────
    public List<String> getEnabledFeatureKeys(String roleName) {
        Map<String, Boolean> overrides = repo.findByRoleName(roleName).stream()
            .collect(Collectors.toMap(RoleFeatureConfig::getFeatureKey, RoleFeatureConfig::isEnabled));
 
        return FEATURE_REGISTRY.stream()
            .filter(f -> roleName.equalsIgnoreCase(f.roleName()))
            .filter(f -> overrides.getOrDefault(f.featureKey(), f.defaultOn()))
            .map(FeatureDef::featureKey)
            .collect(Collectors.toList());
    }
 
    // ── PATCH single toggle ────────────────────────────────────────────────
    @Transactional
    public RoleFeatureDto toggleFeature(ToggleFeatureRequest req, String adminEmail) {
        RoleFeatureConfig cfg = repo
            .findByRoleNameAndFeatureKey(req.getRoleName(), req.getFeatureKey())
            .orElseGet(() -> new RoleFeatureConfig(
                req.getRoleName(), req.getFeatureKey(), req.isEnabled(), adminEmail));
 
        cfg.setEnabled(req.isEnabled());
        cfg.setUpdatedBy(adminEmail);
        repo.save(cfg);
 
        auditRepo.save(new AuditLog(
            req.isEnabled() ? "FEATURE_ENABLED" : "FEATURE_DISABLED",
            adminEmail, null,
            "Feature " + req.getFeatureKey() + (req.isEnabled() ? " ENABLED" : " DISABLED")
            + " for role " + req.getRoleName()
        ));
 
        return getFeaturesForRole(req.getRoleName()).stream()
            .filter(f -> f.featureKey.equals(req.getFeatureKey()))
            .findFirst()
            .orElseThrow();
    }
 
    // ── PATCH bulk toggle ──────────────────────────────────────────────────
    @Transactional
    public List<RoleFeatureDto> bulkToggle(ToggleFeatureRequest req, String adminEmail) {
        for (String key : req.getFeatureKeys()) {
            ToggleFeatureRequest single = new ToggleFeatureRequest();
            single.setRoleName(req.getRoleName());
            single.setFeatureKey(key);
            single.setEnabled(req.isEnabled());
            toggleFeature(single, adminEmail);
        }
        return getFeaturesForRole(req.getRoleName());
    }
 
    // ── DELETE reset role ─────────────────────────────────────────────────
    @Transactional
    public List<RoleFeatureDto> resetRole(String roleName, String adminEmail) {
        repo.deleteByRoleName(roleName);
        auditRepo.save(new AuditLog(
            "FEATURE_RESET", adminEmail, null,
            "All feature overrides reset for role " + roleName
        ));
        return getFeaturesForRole(roleName);
    }
}
 