# Incident Service — ITSM Microservice

A standalone Spring Boot microservice for Incident ticket management.
Follows the same structure as `ticket-service`, `approval-service`, etc.

---

## Port & Database

| Property              | Value                                                          |
|-----------------------|----------------------------------------------------------------|
| Server port           | **8086**                                                       |
| Database              | `serviceeverzfinal1` (shared MySQL DB, same as other services) |
| DB table              | `incident`                                                     |

---

## Service Dependencies

| Service            | Port  | Used for                                     |
|--------------------|-------|----------------------------------------------|
| master-data-service| 8081  | Resolve category/subcategory names, support users |
| mail-service       | 8085  | Send creation confirmation email             |

---

## REST Endpoints

| Method | Path                          | Description                              |
|--------|-------------------------------|------------------------------------------|
| POST   | `/api/incidents`              | Create & submit incident                 |
| GET    | `/api/incidents/{id}`         | Fetch single incident by ID              |
| GET    | `/api/incidents?userId=X`     | Incidents raised by user X (My Tickets)  |
| GET    | `/api/incidents?assignedTo=X` | Incidents assigned to support person X   |
| GET    | `/api/incidents/all`          | All incidents (admin/support dashboard)  |
| PUT    | `/api/incidents/{id}`         | Update status, priority, or assignment   |
| GET    | `/api/incidents/health`       | Health check                             |

---

## Auto-Assignment Logic

On incident creation the service:
1. Calls `GET /api/master/users/support` to fetch all active SUPPORT users.
2. Counts open (non-Resolved, non-Closed) incidents per user.
3. Assigns to the person with the **lowest current load**.
4. If master-service is unreachable the incident is saved **unassigned** — a manager can assign manually via `PUT /api/incidents/{id}`.

---

## Required Master-Data-Service Additions

See `MASTER_DATA_SERVICE_ADDITIONS.txt` for the two snippets to add:
- `UserRepository.java` — `findByDesignationAndStatus(...)` method
- `UserController.java` — `GET /support` endpoint

---

## Running the Service

```bash
# From the incident-service directory
mvn spring-boot:run
```

Make sure MySQL is running and `master-data-service` (port 8081) is up for auto-assignment to work.

---

## Status Flow

```
New → In Progress → Resolved → Closed
```

Closed incidents cannot be updated (returns 400).
