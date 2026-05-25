# Backend

FastAPI REST API for the Sample Dashbord application. Runs with uvicorn locally, Docker for containerised development, and AWS Lambda (via Mangum) in production backed by PostgreSQL on RDS.

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| FastAPI | 0.136 | Web framework |
| SQLAlchemy | 2.0 | ORM |
| Pydantic | 2 | Request / response validation |
| Mangum | 0.21 | AWS Lambda ASGI adapter |
| python-jose | 3.5 | JWT signing and verification |
| passlib / bcrypt | 1.7 / 4.0 | Password hashing |
| Authlib | 1.7 | Google OAuth 2.0 |
| pandas / openpyxl | 3.0 / 3.1 | Excel import and export |
| psycopg2-binary | 2.9 | PostgreSQL driver |
| uvicorn | 0.45 | ASGI server |
| pytz | — | Timezone conversion for session timestamps |

---

## Project Structure

```
backend/
├── app/
│   ├── core/
│   │   ├── dependencies.py   # get_db and get_current_user FastAPI dependencies
│   │   ├── security.py       # JWT encode/decode, bcrypt password hashing
│   │   └── session.py        # Session middleware helpers
│   ├── routers/
│   │   ├── auth.py           # /auth — register, login, logout, admin-login, /me
│   │   ├── oauth.py          # /auth/google — Google OAuth redirect and callback
│   │   ├── samples.py        # /samples — browse, filter, edit, SQL, compare, download
│   │   └── admin.py          # /admin — user CRUD, sample deletion, session monitoring
│   ├── schemas/
│   │   ├── auth.py           # Pydantic models for auth requests and responses
│   │   └── items.py          # Items schema
│   ├── scripts/
│   │   └── load_data.py      # Seeds the samples table from samples.xlsx on first startup
│   ├── database.py           # SQLAlchemy engine — SQLite (local) or PostgreSQL (prod)
│   ├── models.py             # ORM models: User, Sample, SessionLog, Item
│   └── main.py               # App factory: middleware, routers, Mangum Lambda handler
├── data/
│   └── samples.csv           # Source sample data
├── Dockerfile                # python:3.11-slim image, uvicorn on port 8000
├── template.yaml             # AWS SAM template for Lambda + API Gateway deployment
├── build_lambda.sh           # Builds the Lambda deployment zip package
└── requirements.txt          # Pinned Python dependencies
```

---

## Database Models

| Table | Description |
|---|---|
| `users` | User accounts. Supports password auth and Google OAuth (`oauth_provider`, `oauth_id`). `is_admin` flag gates admin-only routes. |
| `samples` | Genomic sequencing sample records — 18 fields including type, technology, group, file prefix, project metadata, and storage locations. |
| `session_logs` | Login/logout timestamps per user. `last_seen` is updated via heartbeat to detect currently online users. |

---

## API Endpoints

### Auth — `/auth`

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/register` | Create a new user account, returns JWT |
| `POST` | `/auth/login` | Login with email + password, returns JWT, writes `SessionLog` |
| `POST` | `/auth/logout` | Closes all open sessions for the token's user |
| `POST` | `/auth/admin-login` | Login for admin users only (`is_admin` required) |
| `GET` | `/auth/me` | Returns the current user's profile (requires JWT) |
| `GET` | `/auth/google` | Redirects to Google OAuth consent screen |
| `GET` | `/auth/google/callback` | Google OAuth callback — creates user if new, issues JWT |

### Samples — `/samples`

| Method | Path | Description |
|---|---|---|
| `GET` | `/samples/` | Paginated list with optional filters: `type`, `technology`, `group`, `project_id`, `search` |
| `GET` | `/samples/filters` | Returns distinct values for each filter dropdown |
| `GET` | `/samples/prefixes` | Returns all distinct file prefixes |
| `GET` | `/samples/prefix/{prefix}` | All samples matching a given file prefix |
| `PUT` | `/samples/{id}` | Update a sample record; triggers export to `samples_updated.xlsx` |
| `POST` | `/samples/query` | Run a raw SELECT query against the `samples` table |
| `GET` | `/samples/compare` | Diff `samples.xlsx` vs `samples_updated.xlsx`, returns changed rows |
| `GET` | `/samples/download/original` | Download the original `samples.xlsx` |
| `GET` | `/samples/download/updated` | Download the updated `samples_updated.xlsx` |

### Admin — `/admin`

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/users` | List all user accounts |
| `POST` | `/admin/users` | Create a new user |
| `DELETE` | `/admin/users/{id}` | Delete a user and close their open sessions |
| `DELETE` | `/admin/samples/{id}` | Delete a sample by database ID |
| `POST` | `/admin/sessions/heartbeat` | Called every 60 s by clients to keep their session alive |
| `GET` | `/admin/sessions/active` | Users seen in the last 5 minutes (live online view) |
| `GET` | `/admin/sessions/history` | Last 100 completed sessions with login/logout times and duration |

---

## Local Development

**Prerequisites:** Python 3.11+

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file (SQLite is used by default if `DATABASE_URL` is not set):

```env
DATABASE_URL=sqlite:///./test.db
SECRET_KEY=change-this-in-dev
SESSION_SECRET=change-this-in-dev
FRONTEND_URL=http://localhost:5173
```

Start the server:

```bash
uvicorn app.main:app --reload --port 8000
```

Interactive API docs are available at `http://localhost:8000/docs`.

On first startup, `load_samples()` seeds the `samples` table from `data/samples.xlsx` if the table is empty.

---

## Docker

```bash
# from the repo root
docker compose up backend
```

The Dockerfile builds a `python:3.11-slim` image and runs uvicorn on port 8000.

---

## Production Deployment (AWS Lambda)

The backend is packaged and deployed via `deploy-backend.sh` in the repo root.

```bash
# from repo root
./deploy-backend.sh
```

The script:
1. Builds a `linux/amd64` package using the AWS Lambda base image (Docker must be running)
2. Zips the app and all dependencies into `lambda_package.zip`
3. Uploads the zip to the Lambda code S3 bucket
4. Updates the Lambda function with the new code

After deploying, set the Lambda environment variables:

```bash
aws lambda update-function-configuration \
  --function-name dashbord-backend \
  --region ap-southeast-2 \
  --environment "Variables={
    DATABASE_URL=postgresql://dashbordAmin:<password>@<db_endpoint>/sample,
    SECRET_KEY=<your-jwt-secret>,
    SESSION_SECRET=<your-session-secret>,
    FRONTEND_URL=https://<cloudfront_url>
  }"
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | No | SQLAlchemy connection string. Defaults to `sqlite:///./test.db`. Use `postgresql://` in production. |
| `SECRET_KEY` | Yes (prod) | JWT signing secret. |
| `SESSION_SECRET` | Yes (prod) | Starlette session middleware secret. |
| `FRONTEND_URL` | Yes (prod) | CloudFront URL added to CORS `allow_origins`. |
