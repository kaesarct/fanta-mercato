from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importa i moduli che abbiamo appena creato, correggendo il typo.
from .settings import settings
from .database import create_tables
from .routers import auth, leagues, auctions


# --- Lifespan Event Handlers ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Connessione al database e creazione delle tabelle...")
    create_tables()
    print("Operazione completata.")
    yield


# Inizializza l'applicazione FastAPI con l'handler lifespan
app = FastAPI(lifespan=lifespan)


# Middleware CORS
origins = [
    settings.redirect_uri_frontend,
    settings.redirect_uri_frontend.replace("https://", "http://"),
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Inclusione dei router
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(leagues.router, prefix="/api", tags=["Leagues"])
app.include_router(auctions.router, prefix="/api", tags=["Auctions"])
