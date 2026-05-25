from typing import List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from mangum import Mangum
from dotenv import load_dotenv
import os

load_dotenv()

from app.database import engine
from app.models import Base
from app.schemas.items import ItemCreate
from app.routers import auth, oauth
from app.routers import samples as samples_router
from app.routers import admin as admin_router
from app.scripts.load_data import load_samples

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://localhost:80",
        "http://localhost:5173",
        "http://localhost:3000",
        os.getenv("FRONTEND_URL", "")  # will be set to CloudFront URL later
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET", "change-this-in-production"),
    max_age=3600,
    https_only=False,
    same_site="lax"
)

Base.metadata.create_all(bind=engine)
load_samples()

from app.schemas import items
app.include_router(items.router)
app.include_router(auth.router)
app.include_router(oauth.router)
app.include_router(samples_router.router)
app.include_router(admin_router.router)

@app.get("/")
def root():
    return {"message": "API running"}

# Lambda handler — Mangum wraps FastAPI for AWS Lambda
handler = Mangum(app)