## Course Eval

This is the demo version of a tool I built for an ad-hoc development role at UBC.

## Tech stack

- Frontend: React 19 + TypeScript, Vite, React Router, Material UI, Recharts.
- Backend: Node.js + Express, MongoDB driver, JWT auth, Multer for uploads, Jest/Supertest for tests.
- Data processing: Python scripts (pandas + pymongo) to convert Excel sheets and generate reference data.
- Dev/ops: Docker + docker-compose for local orchestration.

## Architecture at a glance

- `eval-frontend/`: React UI (login, search, chart/table view, upload).
- `eval-backend/`: Express API, auth, file uploads, data ingestion, and query endpoints.
- `eval-backend/src/data-process/`: Python pipeline for Excel → JSON → Mongo, plus instructor/course aggregation.
- `course-eval-api/`: Bruno collection for API testing.

## Implementation details

### Authentication + authorization
- `POST /auth/login` validates input, checks bcrypt password hashes, and returns a 1‑hour JWT.
- JWTs are required for all `/api/*` routes. `authorizeUpload` restricts uploads to only admin users.
- Login rate limiting is handled in-memory (`rateLimitLogin`).

### Data ingestion flow (uploads)
1) Uploads are accepted via Multer (`/api/upload`) and stored under `eval-backend/uploads/`.
2) `importWorkbook.service` spawns Python (`excel2json.py`) to convert Excel sheets into JSON.
3) New sheets are inserted into MongoDB and tracked in the `processed_sheets` collection.
4) `instructor.py` and `course.py` aggregate reference data (instructors/courses with term lists).
5) Reference data is cached in-memory and persisted to MongoDB for fast dropdown options.
6) Uploaded files are cleaned up after processing.

### Query flow (trends)
- The UI builds a filter payload (instructor, course, from/to term) and posts to `/api/send-query`.
- The backend constructs a MongoDB query with term range logic and returns cleaned records.

## API summary

- `POST /auth/login` → authenticate and receive JWT.
- `GET /api/instructors` → instructor list with courses/times (from reference cache).
- `GET /api/courses` → course list with instructors/times (from reference cache).
- `POST /api/send-query` → filtered evaluation records.
- `POST /api/upload` → upload Excel workbooks (admin only).
