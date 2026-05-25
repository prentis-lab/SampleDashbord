#Handles Google OAuth redirect and callback.
from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from app.database import SessionLocal
from app.models import User
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["oauth"])

GOOGLE_CLIENT_ID = "your-google-client-id"         # move to .env
GOOGLE_CLIENT_SECRET = "your-google-client-secret" # move to .env

oauth = OAuth()
oauth.register(
    name="google",
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

@router.get("/google")
async def google_login(request: Request):
    redirect_uri = "http://localhost:8000/auth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback")
async def google_callback(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")

    db = SessionLocal()
    user = db.query(User).filter(User.oauth_id == user_info["sub"]).first()

    if not user:
        # Create new user from Google profile
        user = User(
            email=user_info["email"],
            oauth_provider="google",
            oauth_id=user_info["sub"],
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Set session
    request.session["user_id"] = user.id
    db.close()

    # Issue JWT and redirect to frontend with token in URL
    jwt_token = create_access_token({"sub": str(user.id)})
    return RedirectResponse(url=f"http://localhost:3000/oauth-success?token={jwt_token}")