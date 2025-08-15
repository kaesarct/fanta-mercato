import os


class Settings:
    keycloak_realm: str = os.getenv("KEYCLOAK_REALM", "tuo_realm_di_default")
    keycloak_client_id: str = os.getenv(
        "KEYCLOAK_CLIENT_ID", "tuo_client_id_di_default"
    )
    keycloak_client_secret: str = os.getenv(
        "KEYCLOAK_CLIENT_SECRET", "la_tua_secret_key"
    )
    backend_url: str = os.getenv("BACKEND_URL", "https://localhost:8000")
    redirect_uri_callback: str = f"{backend_url}/api/auth/callback"
    redirect_uri_frontend: str = os.getenv(
        "REDIRECT_URI_FRONTEND", "https://localhost:4200"
    )

    keycloak_admin: str = os.getenv("KEYCLOAK_ADMIN", "admin")
    keycloak_admin_password: str = os.getenv("KEYCLOAK_ADMIN_PASSWORD", "admin")

    keycloak_url: str = os.getenv("KEYCLOAK_URL", "https://localhost:8443")

    access_cookie_name: str = os.getenv("ACCESS_COOKIE_NAME", "access_token")


settings = Settings()
settings.keycloak_full_url = f"{settings.keycloak_url}/realms/{settings.keycloak_realm}"
