from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from uuid import UUID

from ..database import db, Lega, Squadra, Presidente, Giocatore
from ..keycloak_auth import get_current_user
from ..schemas import LeagueCreate, PlayerCreate


router = APIRouter()


@router.post("/leagues", status_code=status.HTTP_201_CREATED)
async def create_league(league: LeagueCreate):
    try:
        with db.atomic():
            if Lega.select().count() >= 3:
                raise HTTPException(
                    status_code=400, detail="Numero massimo di leghe raggiunto (3)"
                )
            new_league = Lega.create(nome=league.nome)
            return {"id": str(new_league.id), "nome": new_league.nome}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore: {e}")


@router.get("/leagues/{league_id}")
async def get_league(league_id: str):
    try:
        league = Lega.get(Lega.id == league_id)
        squadre = [{"id": str(s.id), "nome": s.nome} for s in league.squadre]
        return {"id": str(league.id), "nome": league.nome, "squadre": squadre}
    except Lega.DoesNotExist:
        raise HTTPException(status_code=404, detail="Lega non trovata")


@router.post("/leagues/{league_id}/teams", status_code=status.HTTP_201_CREATED)
async def create_team(league_id: str, team_name: str):
    try:
        league = Lega.get(Lega.id == league_id)
        if league.squadre.count() >= 8:
            raise HTTPException(
                status_code=400,
                detail="Numero massimo di squadre raggiunto per questa lega (8)",
            )
        new_team = Squadra.create(nome=team_name, lega=league)
        return {
            "id": str(new_team.id),
            "nome": new_team.nome,
            "lega_id": str(league.id),
        }
    except Lega.DoesNotExist:
        raise HTTPException(status_code=404, detail="Lega non trovata")


@router.get("/teams/{team_id}")
async def get_team(team_id: str):
    try:
        team = Squadra.get(Squadra.id == team_id)
        presidenti = [{"id": str(p.id), "email": p.email} for p in team.presidenti]
        giocatori = [
            {"id": str(g.id), "nome": g.nome, "ruolo": g.ruolo} for g in team.giocatori
        ]
        return {
            "id": str(team.id),
            "nome": team.nome,
            "crediti_rimanenti": team.crediti_rimanenti,
            "presidenti": presidenti,
            "giocatori": giocatori,
        }
    except Squadra.DoesNotExist:
        raise HTTPException(status_code=404, detail="Squadra non trovata")


@router.post("/teams/{team_id}/presidents", status_code=status.HTTP_201_CREATED)
async def add_president_to_team(
    team_id: str, current_user: dict = Depends(get_current_user)
):
    user_email = current_user.get("email")
    if not user_email:
        raise HTTPException(
            status_code=400, detail="Email utente non disponibile nel token"
        )
    try:
        team = Squadra.get(Squadra.id == team_id)
        existing_president = Presidente.get_or_none(Presidente.email == user_email)
        if (
            existing_president
            and existing_president.squadra
            and existing_president.squadra.id != team.id
        ):
            raise HTTPException(
                status_code=400,
                detail="Questo utente è già presidente di un'altra squadra.",
            )
        if existing_president:
            existing_president.squadra = team
            existing_president.save()
            new_president = existing_president
        else:
            new_president = Presidente.create(email=user_email, squadra=team)
        return {
            "id": str(new_president.id),
            "email": new_president.email,
            "squadra_id": str(new_president.squadra.id),
        }
    except Squadra.DoesNotExist:
        raise HTTPException(status_code=404, detail="Squadra non trovata")


@router.post("/players", status_code=status.HTTP_201_CREATED)
async def add_player(player: PlayerCreate):
    try:
        squadra = (
            Squadra.get(Squadra.id == player.squadra_id) if player.squadra_id else None
        )
        new_player = Giocatore.create(
            nome=player.nome,
            ruolo=player.ruolo,
            crediti=player.crediti,
            squadra=squadra,
        )
        return {"id": str(new_player.id), "nome": new_player.nome}
    except Squadra.DoesNotExist:
        raise HTTPException(status_code=404, detail="Squadra non trovata")


# --- Nuovi Endpoints per le richieste del frontend ---


@router.get("/leagues/{league_id}/players", response_model=List[dict])
async def get_players_by_league(league_id: str):
    """
    Recupera tutti i giocatori di una specifica lega.
    """
    try:
        # Cerca la lega per verificare che esista
        league = Lega.get(Lega.id == league_id)
        # Filtra i giocatori per la lega
        players = Giocatore.select().join(Squadra).where(Squadra.lega == league)
        # Serializza i giocatori in un formato JSON
        return [
            {
                "id": str(p.id),
                "nome": p.nome,
                "ruolo": p.ruolo,
                "crediti": p.crediti,
                "squadra": p.squadra.nome if p.squadra else None,
                "status": "available",  # Lo status è aggiunto per il frontend, il backend non lo gestisce.
            }
            for p in players
        ]
    except Lega.DoesNotExist:
        raise HTTPException(status_code=404, detail="Lega non trovata")


@router.get("/auth/me")
async def get_my_league(current_user: dict = Depends(get_current_user)):
    """
    Recupera l'ID della lega a cui appartiene l'utente autenticato.
    """
    user_email = current_user.get("email")
    if not user_email:
        return {"leagueId": None}  # L'utente non ha un'email nel token

    try:
        # Cerca il presidente associato all'email dell'utente
        president = Presidente.get(Presidente.email == user_email)
        # Se il presidente ha una squadra, recupera l'ID della lega
        if president.squadra:
            return {"leagueId": str(president.squadra.lega.id)}
        else:
            return {"leagueId": None}
    except Presidente.DoesNotExist:
        # Se l'utente non è un presidente, restituisci null
        return {"leagueId": None}
