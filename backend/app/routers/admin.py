from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User, Sample, SessionLog
from app.core.security import hash_password, decode_access_token
from app.core.dependencies import get_db
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta, timezone

import pytz

router = APIRouter(prefix="/admin", tags=["admin"])

class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str
    is_admin: Optional[bool] = False

def convert_time(dt, timezone_str):
    if dt is None:
        return None
    try:
        tz = pytz.timezone(timezone_str)
        utc_dt = pytz.utc.localize(dt)
        local_dt = utc_dt.astimezone(tz)
        return local_dt.strftime("%Y-%m-%d %H:%M:%S")
    except Exception:
        return dt.strftime("%Y-%m-%d %H:%M:%S")

def get_timezone(request: Request) -> str:
    return request.headers.get("X-Timezone", "UTC")

@router.get("/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.post("/users")
def create_user(body: CreateUserRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        is_admin=body.is_admin,
        is_active=True
    )
    db.add(user)
    db.commit()
    return {"message": "User created"}

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Close any open sessions for this userd
    open_sessions = db.query(SessionLog).filter(
        SessionLog.user_id == user_id,
        SessionLog.logout_time == None
    ).all()
    for session in open_sessions:
        session.logout_time = datetime.now(timezone.utc).replace(tzinfo=None)

    db.delete(user)
    db.commit()
    return {"message": "User deleted"}

@router.delete("/samples/{sample_id}")
def delete_sample(sample_id: int, db: Session = Depends(get_db)):
    sample = db.query(Sample).filter(Sample.id == sample_id).first()
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")
    db.delete(sample)
    db.commit()
    return {"message": "Sample deleted"}

@router.post("/sessions/heartbeat")
def heartbeat(request: Request, db: Session = Depends(get_db)):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = auth_header.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = int(payload.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    now = datetime.now(timezone.utc).replace(tzinfo=None)

    # Close all old open sessions except the most recent one
    open_sessions = db.query(SessionLog).filter(
        SessionLog.user_id == user_id,
        SessionLog.logout_time == None
    ).order_by(SessionLog.login_time.desc()).all()

    if len(open_sessions) > 1:
        # Close all but the most recent
        for old_session in open_sessions[1:]:
            old_session.logout_time = now
        db.commit()

    # Update or create the active session
    log = open_sessions[0] if open_sessions else None

    if not log:
        log = SessionLog(
            user_id=user_id,
            email=user.email,
            login_time=now
        )
        db.add(log)

    log.last_seen = now
    db.commit()
    return {"ok": True}

@router.get("/sessions/active")
def get_active_sessions(request: Request, db: Session = Depends(get_db)):
    timezone_str = get_timezone(request)
    cutoff = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(minutes=5)
    sessions = db.query(SessionLog).filter(
        SessionLog.logout_time == None,
        SessionLog.last_seen >= cutoff
    ).all()

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    result = []
    for s in sessions:
        # Check user still exists
        user = db.query(User).filter(User.id == s.user_id).first()
        if not user:
            # Close the session since user no longer exists
            s.logout_time = now
            db.commit()
            continue

        duration = now - s.login_time
        total_seconds = int(duration.total_seconds())
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        seconds = total_seconds % 60
        result.append({
            "id": s.id,
            "user_id": s.user_id,
            "email": s.email,
            "login_time": convert_time(s.login_time, timezone_str),
            "duration": f"{hours:02d}:{minutes:02d}:{seconds:02d}"
        })
    return result
@router.get("/sessions/history")
def get_session_history(request: Request, db: Session = Depends(get_db)):
    timezone_str = get_timezone(request)
    sessions = db.query(SessionLog).filter(
        SessionLog.logout_time != None
    ).order_by(SessionLog.login_time.desc()).limit(100).all()

    result = []
    for s in sessions:
        duration = s.logout_time - s.login_time
        total_seconds = int(duration.total_seconds())
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        result.append({
            "id": s.id,
            "email": s.email,
            "login_time": convert_time(s.login_time, timezone_str),
            "logout_time": convert_time(s.logout_time, timezone_str),
            "duration": f"{hours:02d}h {minutes:02d}m"
        })
    return result