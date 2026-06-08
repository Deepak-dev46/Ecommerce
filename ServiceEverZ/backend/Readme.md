# Integrated Backend — Team A + Team C

## Services Included

| Service | Port | Source |
|---------|------|--------|
| eureka-service | 8761 | Team A |
| api-gateway | 8080 | **Merged** (A+C) |
| auth-service | dynamic | Team A |
| user-service | dynamic | Team A |
| role-service | dynamic | Team A |
| rmo-service | dynamic | Team A |
| ticket-service | dynamic | **Merged** (A+C) |
| service-catalog | dynamic | Team A |
| assignment-service | dynamic | Team A |
| fixed-approval-service | dynamic | Team A |
| sla-service | dynamic | Team A |
| action-service | dynamic | Team A |
| mail-service | dynamic | Team A |
| email-service | dynamic | Team A |
| master-data-service | dynamic | Team A |

## Merge Details

### ticket-service (Key Integration)

**Team A** contributed:
- Core ticket CRUD (`GET/POST /api/tickets`, `/{id}`)
- Comments, history, SLA tracking
- CSAT survey feature (`CsatController`, `CsatService`)
- Collaboration/internal notes (`CollaborationController`)
- Spring Mail for direct email sending

**Team C** contributed:
- `OurTicketService` / `OurTicketServiceImpl` — full approval flow
- `POST /api/tickets/draft` — save without triggering approval
- `POST /api/tickets/submit` — submit an existing draft
- `GET /api/tickets/user-tickets` — tickets with L1/L2 queue status
- Feign clients: `ApprovalClient`, `MailClient`, `MasterDataClient`, `UserServiceClient`
- New models: `TicketAccessPeriod`, `TicketAttachmentData`
- New DTOs: `ApiResponse`, `EmailRequest`, `InitiateApprovalRequest`, `SubmitTicketRequest`

**POST /api/tickets** behavior: Team C's `createAndSubmit` replaces Team A's simple create.
It creates the ticket AND triggers L1/L2 approval queue + emails the requester.
Team A's `getMyTickets`, `assignTicket`, SLA, CSAT, and all other endpoints are **unchanged**.

### api-gateway (Key Integration)

Team A's gateway is used as base. Team C's gateway was missing some routes (CSAT, rmo-service).
The integrated gateway keeps **all Team A routes** and **adds** routes for:
- `/api/approvals/**` → fixed-approval-service
- `/api/master-data/**` → master-data-service
- `/api/mail/**` → mail-service
- `/api/assignments/**` → assignment-service
- `/api/sla/**` → sla-service
- `/api/actions/**` → action-service

## How to Start

```bash
cd scripts
chmod +x script.sh stop.sh
./script.sh
```

Services auto-register with Eureka. API Gateway starts last.

## Database

All services connect to `serviceeverz` database on `localhost:3306`.
Update credentials in each service's `application.properties` / `application.yml`.
