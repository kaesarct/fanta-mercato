from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import RedirectResponse
import jwt
from jwt import PyJWTError
from .keycloak_auth import keycloak_openid
from .settings import settings

origins = [
    settings.redirect_uri_frontend,
    settings.redirect_uri_frontend.replace("https://", "http://"),
]
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/auth/login")
async def login(request: Request):
    auth_url = keycloak_openid.auth_url(
        redirect_uri=settings.redirect_uri_callback, scope="openid profile email"
    )
    return RedirectResponse(url=auth_url)


@app.get("/api/auth/callback")
async def auth_callback(code: str, request: Request):
    try:
        token = keycloak_openid.token(
            grant_type="authorization_code",
            code=code,
            redirect_uri=settings.redirect_uri_callback,
        )

        access_token = token["access_token"]

        response = RedirectResponse(url=settings.redirect_uri_frontend)

        # Imposta cookie sicuro
        response.set_cookie(
            key=settings.access_cookie_name,
            value=access_token,
            httponly=True,
            secure=True,
            samesite="None",
            max_age=token.get("expires_in", 3600),
        )

        return response

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/auth/me")
def me(request: Request):
    token = request.cookies.get(settings.access_cookie_name)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(token, options={"verify_signature": False})
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    return {"username": payload.get("preferred_username")}
