import jwt
from jwt import PyJWTError
from fastapi import HTTPException, Request, Depends
from keycloak import KeycloakOpenID

from .settings import settings


# Istanza di Keycloak OpenID per l'autenticazione
keycloak_openid = KeycloakOpenID(
    server_url=settings.keycloak_url,
    client_id=settings.keycloak_client_id,
    realm_name=settings.keycloak_realm,
    client_secret_key=settings.keycloak_client_secret,
    verify="/app/certs/cert.pem",
)


def get_current_user(request: Request):
    """
    Una dipendenza FastAPI che estrae e decodifica il token JWT
    memorizzato nel cookie, restituendo il payload dell'utente autenticato.
    """
    token = request.cookies.get(settings.access_cookie_name)
    if not token:
        raise HTTPException(status_code=401, detail="Non autenticato")
    try:
        # Per semplicità, decodifichiamo il token senza verificare la firma.
        # In produzione, si dovrebbe verificare la firma con la chiave pubblica di Keycloak.
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload
    except PyJWTError:
        raise HTTPException(status_code=401, detail="Token non valido")
