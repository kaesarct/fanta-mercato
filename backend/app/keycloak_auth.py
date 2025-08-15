from keycloak import KeycloakOpenID
from .settings import settings

keycloak_openid = KeycloakOpenID(
    server_url=settings.keycloak_url,
    client_id=settings.keycloak_client_id,
    realm_name=settings.keycloak_realm,
    client_secret_key=settings.keycloak_client_secret,
    verify="/app/certs/cert.pem",
)
