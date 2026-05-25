#session middleware config
from starlette.middleware.sessions import SessionMiddleware

SECRET_SESSION_KEY = "another-secret-key-change-this"  # move to .env

def add_session_middleware(app):
    app.add_middleware(
        SessionMiddleware,
        secret_key=SECRET_SESSION_KEY,
        max_age=3600,         # 1 hour session
        https_only=False,     # set True in production
        same_site="lax"
    )