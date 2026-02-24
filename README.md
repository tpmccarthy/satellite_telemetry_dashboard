# Satellite Telemetry Dashboard

Full‑stack implementation of the Satellite Telemetry Dashboard take‑home assignment.

## Stack

* **Backend:** FastAPI (`main.py`) + Uvicorn
* **Database:** SQLite (`./telemetry.db`)
* **Frontend:** React + Vite + TypeScript
* **Testing:** Pytest (backend), npm test (frontend)
* **Containerization:** Docker + Docker Compose (with DB volume persistence)

---

## Running the Application

### Recommended (Docker Compose)

```bash
docker compose up --build
```

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend API: [http://localhost:8000/telemetry](http://localhost:8000/telemetry)
* Swagger Docs: [http://localhost:8000/docs#/](http://localhost:8000/docs#/)

Database persistence is handled via a Docker volume mapped to `./telemetry.db`.

Stop:

```bash
docker compose down
```

---

## Backend Overview

Entry point: `main.py`

Run command (inside container):

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Endpoints

* `GET /telemetry`

  * Optional filters: `satelliteId`, `status`
  * Supports pagination: `page`, `limit`

* `GET /telemetry/{id}`

* `POST /telemetry`

* `DELETE /telemetry/{id}`

### Validation

* `timestamp` must be valid ISO 8601
* `altitude` > 0
* `velocity` > 0
* `status` required

CORS is enabled to allow frontend communication.

---

## Frontend Overview

Built with Vite + React.

Features:

* Telemetry table (Satellite ID, Timestamp, Altitude, Velocity, Status)
* Filtering by Satellite ID and Status
* Add new telemetry entries
* Delete entries
* Client‑side sorting (Timestamp, Altitude, Velocity)
* Loading indicator
* Error handling

API base URL is hardcoded in `App.tsx`.

---

## Testing

### Backend

```bash
pytest
```

### Frontend

```bash
npm test
```

---

## Assumptions

* Authentication not required per assignment scope.
* SQLite sufficient for runtime persistence.
* Pagination implemented server‑side.
* Sorting implemented client‑side.

This implementation satisfies all required backend and frontend functionality defined in the assignment, including Docker support and automated tests.
