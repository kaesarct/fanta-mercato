from pydantic import BaseModel, Field
from uuid import UUID


class LeagueCreate(BaseModel):
    """Schema per la creazione di una nuova lega."""

    nome: str


class PlayerCreate(BaseModel):
    """Schema per l'aggiunta di un nuovo giocatore."""

    nome: str
    ruolo: str
    crediti: int
    squadra_id: UUID = Field(None)


class Bid(BaseModel):
    """Schema per l'offerta in un'asta."""

    offerta: int
