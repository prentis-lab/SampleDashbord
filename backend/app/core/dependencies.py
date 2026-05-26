#The get_current_user function you'll inject into any protected route.
from fastapi import Depends, HTTPException, Request
from app.database import SessionLocal
from app.models import User
from app.core.security import decode_access_token

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(request: Request, db=Depends(get_db)) -> User:
    # 1. Try JWT from Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        payload = decode_access_token(token)
        if payload:
            user = db.query(User).filter(User.id == payload.get("sub")).first()
            if user:
                return user

    # 2. Fall back to session
    user_id = request.session.get("user_id")
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            return user

    raise HTTPException(status_code=401, detail="Not authenticated")

def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user