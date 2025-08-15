from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import keycloak

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

keycloak_openid = keycloak.KeycloakOpenID(
    server_url="http://keycloak:8080",
    client_id="fanta-mercato",
    realm_name="fanta-mercato",
    client_secret_key="Iovki9M9EeYqapNqOFzqLYSiDUhFmQzj",
    verify=False,
)


def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        keycloak_openid.decode_token(token, key=keycloak_openid.public_key())
        return True
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


@app.get("/api/protected")
def protected_route(user: bool = Depends(get_current_user)):
    return {"message": "Hello from protected API!"}


@app.get("/api/public")
def public_route():
    return {"message": "Hello from public API!"}
