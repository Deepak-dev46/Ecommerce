# Ticket Service — Team D Microservice

A Spring Boot microservice for ticket management. No security module (handled by separate service).

## Tech Stack
- **Java 17** + **Spring Boot 3.2.5**
- **Spring Data JPA** (Hibernate)
- **MySQL 8+**
- No Lombok — plain Java classes

---

## Setup

### 1. Database
Create the database (Spring will auto-create tables on startup):
```sql
CREATE DATABASE ticket_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configure `application.properties`
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ticket_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
spring.datasource.username=YOUR_MYSQL_USER
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### 3. Run
```bash
mvn spring-boot:run
```
Service starts on **port 8082**.

### 4. Frontend `.env`
In your frontend project, set:
```
VITE_USER_SERVICE_URL=http://localhost:8082
```

---

## API Endpoints

### End User Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tickets?userId={id}` | Get tickets for a user |
| GET | `/api/tickets/{id}` | Get ticket by ID |
| POST | `/api/tickets` | Create a new ticket |
| GET | `/api/tickets/{id}/comments` | Get comments for a ticket |
| POST | `/api/tickets/{id}/comments` | Add a comment |
| POST | `/api/tickets/{id}/reopen` | Reopen a resolved ticket |
| GET | `/api/tickets/{id}/history` | Get status history |

### Support Personnel Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tickets/assigned?assigneeId={id}` | Get assigned tickets |
| PATCH | `/api/tickets/{id}/status` | Update ticket status |
| GET | `/api/tickets/{id}/sla` | Get live SLA data |
| PUT | `/api/tickets/{id}/assign` | Assign ticket to agent |

---

## Request / Response Examples

### Create Ticket
```json
POST /api/tickets
{
  "subject": "Cannot access payroll portal",
  "description": "White screen after password reset",
  "category": "Access & Authentication",
  "priority": "HIGH",
  "requesterId": 1001,
  "requesterName": "Alice Morgan"
}
```

### Add Comment
```json
POST /api/tickets/1/comments
{
  "body": "I tried clearing the cache, still not working.",
  "authorId": 1001,
  "authorName": "Alice Morgan",
  "authorRole": "END_USER"
}
```

### Update Ticket Status (Support)
```json
PATCH /api/tickets/1/status
{
  "status": "RESOLVED",
  "resolutionNotes": "Cleared session cache, user can now access the portal.",
  "changedBy": "Bob Chen"
}
```

### Reopen Ticket
```json
POST /api/tickets/1/reopen
{
  "reason": "Issue has reoccurred after the fix.",
  "requestedBy": "Alice Morgan"
}
```

---

## Ticket Statuses
`OPEN` → `IN_PROGRESS` → `ON_HOLD` → `RESOLVED` → `CLOSED`  
`RESOLVED` → `REOPENED` (via reopen endpoint)

## Priority & SLA Hours
| Priority | SLA Hours |
|----------|-----------|
| LOW | 72h |
| MEDIUM | 24h |
| HIGH | 8h |
| CRITICAL | 4h |

---

## Frontend Change Required

Replace `src/api/ticketApi.js` with the provided `FRONTEND_ticketApi.js` file.

**Key changes:**
1. All paths now consistently use `api/tickets/...` (no leading `/` issues)
2. `getAssignedTickets(assigneeId)` now accepts and sends the support agent's ID
3. `createTicket(body)` added for future ticket creation UI
4. `assignTicket(id, body)` added for assign-ticket feature
