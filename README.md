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

### Docker (Single Container Runs)

You may build and run each service independently without Docker Compose.

#### Backend

```bash
cd backend
docker build -t telemetry-backend .
docker run -p 8000:8000 -v telemetry_data:/app/data telemetry-backend
```

Backend available at: [http://localhost:8000](http://localhost:8000)
Swagger Docs: [http://localhost:8000/docs#/](http://localhost:8000/docs#/)

#### Frontend

```bash
cd frontend
docker build -t telemetry-frontend .
docker run -p 5173:80 telemetry-frontend
```

Frontend available at: [http://localhost:5173](http://localhost:5173)

---

### Running Without Docker (Optional)

#### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
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

Built with Python + FastAPI.

Features:
* RESTful telemetry API
* Server-side filtering & pagination
* Data validation via Pydantic
* UUID-based record lifecycle management
* SQLite persistence
* Swagger documentation
* Async test coverage

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
* Add telemetry entry
* Delete telemetry entry
* Client-side sorting ascending/descending (Timestamp, Altitude, Velocity)
* Client-side sorting rotation (Vehicle, Status)
* Loading indicator
* Error handling

API base URL is hardcoded in `App.tsx`.

---

## Testing

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest
```

### Frontend

```bash
cd frontend
npm install
npm test
```
