from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User, SessionLog
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserOut
from app.core.security import hash_password, verify_password, create_access_token, SECRET_KEY
from app.core.dependencies import get_db, get_current_user
from pydantic import BaseModel
from datetime import datetime


router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=body.email, hashed_password=hash_password(body.password))
    db.add(user)
    db.commit()
    return {"message": "Registration received. You can log in once an admin approves your account."}

@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account pending admin approval")

    # Record login time
    log = SessionLog(user_id=user.id, email=user.email, login_time=datetime.utcnow())
    db.add(log)
    db.commit()

    # Store log id in session so we can update logout time later
    request.session["user_id"] = user.id
    request.session["session_log_id"] = log.id

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token}

@router.post("/logout")
def logout(request: Request, db: Session = Depends(get_db)):
    # Close session log via JWT token
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        from app.core.security import decode_access_token
        token = auth_header.split(" ")[1]
        payload = decode_access_token(token)
        if payload:
            user_id = int(payload.get("sub"))
            # Close all open sessions for this user
            open_sessions = db.query(SessionLog).filter(
                SessionLog.user_id == user_id,
                SessionLog.logout_time == None
            ).all()
            for session in open_sessions:
                session.logout_time = datetime.utcnow()
            db.commit()

    request.session.clear()
    return {"message": "Logged out"}

@router.post("/admin-login", response_model=TokenResponse)
def admin_login(body: LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account pending admin approval")
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Access denied — admins only")

    # Record login time for admin too
    log = SessionLog(user_id=user.id, email=user.email, login_time=datetime.utcnow())
    db.add(log)
    db.commit()

    request.session["user_id"] = user.id
    request.session["is_admin"] = True
    request.session["session_log_id"] = log.id

    token = create_access_token({"sub": str(user.id), "is_admin": True})
    return {"access_token": token}

@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user

class BootstrapRequest(BaseModel):
    email: str
    token: str

@router.post("/bootstrap")
def bootstrap(body: BootstrapRequest, db: Session = Depends(get_db)):
    if body.token != SECRET_KEY:
        raise HTTPException(status_code=403, detail="Invalid bootstrap token")
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found — register first")
    user.is_admin  = True
    user.is_active = True
    db.commit()
    return {"message": f"{body.email} is now an active admin"}