from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timedelta
from typing import List

from ..database import Lega, db, Asta, Round, Giocatore, AstaGiocatore, Presidente, Squadra
from ..keycloak_auth import get_current_user
from ..schemas import Bid


router = APIRouter()


@router.post("/leagues/{league_id}/auctions", status_code=status.HTTP_201_CREATED)
async def create_auction(league_id: str):
    try:
        league = Lega.get(Lega.id == league_id)
        if Asta.get_or_none(Asta.lega == league):
            raise HTTPException(
                status_code=400, detail="Esiste già un'asta per questa lega"
            )
        new_auction = Asta.create(lega=league, stato="attiva")
        return {
            "id": str(new_auction.id),
            "lega_id": str(league.id),
            "stato": new_auction.stato,
        }
    except Lega.DoesNotExist:
        raise HTTPException(status_code=404, detail="Lega non trovata")


@router.post("/auctions/{auction_id}/rounds", status_code=status.HTTP_201_CREATED)
async def add_round_to_auction(auction_id: str, players_ids: List[str]):
    try:
        auction = Asta.get(Asta.id == auction_id)
        expiration_time = datetime.utcnow() + timedelta(minutes=5)
        new_round = Round.create(
            asta=auction, data_chiusura=expiration_time, stato="attivo"
        )
        for player_id in players_ids:
            try:
                player = Giocatore.get(Giocatore.id == player_id)
                AstaGiocatore.create(
                    round=new_round, giocatore=player, data_scadenza=expiration_time
                )
            except Giocatore.DoesNotExist:
                raise HTTPException(
                    status_code=404, detail=f"Giocatore con ID {player_id} non trovato"
                )
        return {
            "id": str(new_round.id),
            "data_chiusura": new_round.data_chiusura.isoformat(),
        }
    except Asta.DoesNotExist:
        raise HTTPException(status_code=404, detail="Asta non trovata")


@router.post("/auctions/{auction_id}/bid")
async def place_bid(
    auction_id: str,
    giocatore_id: str,
    bid: Bid,
    current_user: dict = Depends(get_current_user),
):
    user_email = current_user.get("email")
    offerta = bid.offerta
    try:
        auction = Asta.get(Asta.id == auction_id)
        president = Presidente.get(Presidente.email == user_email)
        team = president.squadra
        if not team:
            raise HTTPException(
                status_code=403, detail="L'utente non è associato a una squadra"
            )
        auction_player = AstaGiocatore.get(
            AstaGiocatore.giocatore == giocatore_id, AstaGiocatore.round.asta == auction
        )
        player_info = auction_player.giocatore
        if datetime.utcnow() > auction_player.data_scadenza:
            raise HTTPException(
                status_code=400, detail="L'asta per questo giocatore è scaduta"
            )
        if offerta <= auction_player.offerta_corrente:
            raise HTTPException(
                status_code=400,
                detail="L'offerta deve essere maggiore dell'offerta corrente",
            )
        if offerta > team.crediti_rimanenti:
            raise HTTPException(status_code=400, detail="Crediti insufficienti")
        max_players = {
            "Portiere": 3,
            "Difensore": 8,
            "Centrocampista": 8,
            "Attaccante": 6,
        }
        current_players = {
            "Portiere": team.num_portieri,
            "Difensore": team.num_difensori,
            "Centrocampista": team.num_centrocampisti,
            "Attaccante": team.num_attaccanti,
        }
        if current_players.get(player_info.ruolo, 0) >= max_players.get(
            player_info.ruolo, 0
        ):
            if player_info.squadra and player_info.squadra.id != team.id:
                raise HTTPException(
                    status_code=400,
                    detail=f"Posti per il ruolo '{player_info.ruolo}' esauriti.",
                )
        new_expiration = datetime.utcnow() + timedelta(seconds=30)
        auction_player.offerta_corrente = offerta
        auction_player.offerente = president
        auction_player.data_scadenza = new_expiration
        auction_player.save()
        return {
            "message": "Offerta piazzata con successo!",
            "nuova_scadenza": new_expiration.isoformat(),
        }
    except (
        Asta.DoesNotExist,
        Presidente.DoesNotExist,
        Squadra.DoesNotExist,
        AstaGiocatore.DoesNotExist,
    ) as e:
        raise HTTPException(status_code=404, detail=f"Risorsa non trovata: {e}")


@router.get("/auctions/{auction_id}/my_team")
async def get_my_team_details(
    auction_id: str, current_user: dict = Depends(get_current_user)
):
    user_email = current_user.get("email")
    try:
        president = Presidente.get(Presidente.email == user_email)
        team = president.squadra
        if not team:
            raise HTTPException(
                status_code=403, detail="L'utente non è associato a una squadra"
            )
        team_players = [
            {"id": str(g.id), "nome": g.nome, "ruolo": g.ruolo} for g in team.giocatori
        ]
        return {
            "squadra": {
                "id": str(team.id),
                "nome": team.nome,
                "crediti_rimanenti": team.crediti_rimanenti,
            },
            "giocatori": team_players,
        }
    except (Presidente.DoesNotExist, Squadra.DoesNotExist):
        raise HTTPException(
            status_code=403, detail="L'utente non è associato a una squadra"
        )


@router.get("/auctions/{auction_id}/check_status")
async def check_auction_status(auction_id: str):
    try:
        auction = Asta.get(Asta.id == auction_id)
        now = datetime.utcnow()
        for round_data in auction.rounds:
            if round_data.stato == "attivo":
                closed_bids = []
                for player_data in round_data.giocatori_in_asta:
                    if (
                        now > player_data.data_scadenza
                        and player_data.offerta_corrente > 0
                    ):
                        winner_president = player_data.offerente
                        if winner_president and winner_president.squadra:
                            winner_team = winner_president.squadra
                            player_info = player_data.giocatore
                            winner_team.crediti_rimanenti -= (
                                player_data.offerta_corrente
                            )
                            if player_info.ruolo == "Portiere":
                                winner_team.num_portieri += 1
                            elif player_info.ruolo == "Difensore":
                                winner_team.num_difensori += 1
                            elif player_info.ruolo == "Centrocampista":
                                winner_team.num_centrocampisti += 1
                            elif player_info.ruolo == "Attaccante":
                                winner_team.num_attaccanti += 1
                            player_info.squadra = winner_team
                            winner_team.save()
                            player_info.save()
                            closed_bids.append(
                                {
                                    "giocatore": player_info.nome,
                                    "squadra_assegnata": winner_team.nome,
                                    "prezzo": player_data.offerta_corrente,
                                }
                            )
                all_players_expired = all(
                    now > p.data_scadenza for p in round_data.giocatori_in_asta
                )
                if all_players_expired:
                    round_data.stato = "completato"
                    round_data.save()
                    return {
                        "message": f"Round {round_data.id} completato.",
                        "aste_chiuse": closed_bids,
                    }
    except Asta.DoesNotExist:
        raise HTTPException(status_code=404, detail="Asta non trovata")
    return {"message": "Nessuna asta da chiudere o completare in questo momento."}
