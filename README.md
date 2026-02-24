# Satellite Telemetry Dashboard

Implementation of the Satellite Telemetry Dashboard take-home assignment.

## Stack

* **Backend:** FastAPI (`main.py`) + Uvicorn
* **Database:** SQLite (persisted via Docker volume at `/app/data`)
* **Frontend:** React + Vite + TypeScript
* **Testing:** Pytest (backend), npm test (frontend)
* **Containerization:** Docker + Docker Compose

---

## Running the Application

### Docker Compose (Recommended)

```bash
docker compose up --build
```

### Services

**Backend**

* Container: `telemetry-backend`
* Port: `8000:8000`
* Healthcheck enabled
* SQLite persisted via volume:

```yaml
volumes:
  - telemetry_data:/app/data
```

**Frontend**

* Container: `telemetry-frontend`
* Port: `5173:80`
* Depends on backend healthcheck

### Access

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend API: [http://localhost:8000/telemetry](http://localhost:8000/telemetry)
* Swagger Docs: [http://localhost:8000/docs#/](http://localhost:8000/docs#/)

Stop services:

```bash
docker compose down
```

---

### Running Without Docker (Optional)

#### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend available at: [http://localhost:8000](http://localhost:8000)

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend available at: [http://localhost:5173](http://localhost:5173)

---

## Backend

Entry point: `main.py`

Run command (inside container):

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Endpoints

* `GET /telemetry`

  * Filters: `satelliteId`, `status`
  * Pagination: `limit`, `offset`
* `GET /telemetry/{id}`
* `POST /telemetry`
* `DELETE /telemetry/{id}`

### Validation

* `timestamp` must be ISO 8601
* `altitude` > 0
* `velocity` > 0
* `status` required

CORS enabled for `http://localhost:5173`.

---

## Frontend

Built with Vite + React.

Features:

* Telemetry table (Satellite ID, Timestamp, Altitude, Velocity, Status)
* Filter by Satellite ID and Status
* Add telemetry entry
* Delete telemetry entry
* Client-side sorting (Timestamp, Altitude, Velocity)
* Loading indicator
* Error handling

API base URL is hardcoded in `App.tsx`.

---

## Testing

### Backend

```bash
cd backend
pip install -r requirements.txt
pytest
```

### Frontend

```bash
cd frontend
npm install
npm test
```
