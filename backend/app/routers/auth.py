import jwt
from jwt import PyJWTError
from fastapi import APIRouter, HTTPException, Request, Response, Depends
from starlette.responses import RedirectResponse

from ..settings import settings
from ..keycloak_auth import keycloak_openid, get_current_user


router = APIRouter()


@router.get("/login")
async def login(request: Request):
    auth_url = keycloak_openid.auth_url(
        redirect_uri=settings.redirect_uri_callback, scope="openid profile email"
    )
    return RedirectResponse(url=auth_url)


@router.get("/callback")
async def auth_callback(code: str, request: Request):
    try:
        token = keycloak_openid.token(
            grant_type="authorization_code",
            code=code,
            redirect_uri=settings.redirect_uri_callback,
        )
        access_token = token["access_token"]
        response = RedirectResponse(url=settings.redirect_uri_frontend)
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


@router.get("/me")
def me(request: Request):
    token = request.cookies.get(settings.access_cookie_name)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
    except PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"username": payload.get("preferred_username")}
