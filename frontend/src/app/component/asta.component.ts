import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';


// Importazioni da file separati
import { Player, FantasyTeam, Auction, AuctionHistoryItem } from '../shared/interfaces';
import { ApiService } from '../services/api.services';


@Component({
  selector: 'app-asta',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, InputTextModule, ButtonModule, PanelModule, MessageModule, FormsModule, ToastModule],
  templateUrl: './asta.component.html',
  providers: [MessageService, ApiService]
})
export class AstaComponent implements OnInit {

  private apiService = inject(ApiService);
  private messageService = inject(MessageService);

  // Stati dell'applicazione usando i signal
  players = signal<Player[]>([]);
  myTeam = signal<FantasyTeam | null>(null);
  selectedPlayer = signal<Player | null>(null);
  currentAuction = signal<Auction | null>(null);
  auctionHistory = signal<AuctionHistoryItem[]>([]);
  timeLeft = signal<number>(0);

  // Variabili per l'interazione
  bidInput = signal<number>(0);
  searchTerm = signal<string>('');
  selectedRole = signal<string | null>(null);
  roles = ['P', 'D', 'C', 'A'];

  // Dati fittizi per l'esempio del layout
  teams = signal<any[]>([
    {
      id: "squadra-a",
      name: "Squadra A",
      credits: 100,
      players: [
        { nome: "Giocatore A", crediti: 10, ruolo: 'P', status: 'available' },
        { nome: "Giocatore B", crediti: 15, ruolo: 'D', status: 'available' },
        { nome: "Giocatore C", crediti: 20, ruolo: 'C', status: 'available' },
        { nome: "Giocatore D", crediti: 5, ruolo: 'A', status: 'available' },
      ]
    },
    {
      id: "squadra-b",
      name: "Squadra B",
      credits: 100,
      players: [
        { nome: "Giocatore E", crediti: 12, ruolo: 'P', status: 'available' },
        { nome: "Giocatore F", crediti: 18, ruolo: 'D', status: 'available' },
        { nome: "Giocatore G", crediti: 22, ruolo: 'C', status: 'available' },
        { nome: "Giocatore H", crediti: 7, ruolo: 'A', status: 'available' },
      ]
    }
  ]);

  // Dati fissi per l'esempio, in produzione verrebbero da un'API
  leagueId = "d8f6d7d2-7c3d-4c3e-8b1d-8f6d7d27c3d4";

  private intervalId: any;

  async ngOnInit(): Promise<void> {
    this.leagueId = await this.apiService.getLeagueIdByUsername();
    this.players.set(await this.apiService.getPlayers(this.leagueId));
    // In un'applicazione reale, dovremmo gestire il login e l'ottenimento di questi ID
    await this.fetchMyTeamAndAuctionStatus();
  }

  // Metodo per filtrare i giocatori in base alla ricerca e al ruolo
  filteredPlayers(): Player[] {
    const players = this.players();
    const term = this.searchTerm().toLowerCase();
    const role = this.selectedRole();
    return players.filter(player => {
      const matchesSearch = player.nome.toLowerCase().includes(term);
      const matchesRole = !role || player.ruolo === role;
      const isAvailable = player.status === 'available';
      return matchesSearch && matchesRole && isAvailable;
    });
  }

  setSelectedRole(role: string | null): void {
    this.selectedRole.set(role);
  }

  // Aggiorna lo stato della squadra e dell'asta
  private async fetchMyTeamAndAuctionStatus(): Promise<void> {
    if (this.currentAuction()?.id) {
      try {
        const teamDetails = await this.apiService.getMyTeamDetails(this.currentAuction()!.id);
        this.myTeam.set(teamDetails.squadra);
        // ... (logica per i giocatori)
      } catch (e) {
        console.error("Errore nel recupero dei dettagli della squadra", e);
      }
    }
  }

  // Avvia l'asta per un giocatore
  async startAuction(player: Player): Promise<void> {
    if (this.currentAuction()) {
      this.messageService.add({ severity: 'error', summary: 'Errore', detail: 'Un\'asta è già in corso!' });
      return;
    }

    try {
      const response = await this.apiService.createAuction(this.leagueId);
      const newAuctionId = response.id;
      // L'API del backend non gestisce la lista di giocatori per l'asta
      // Per ora, impostiamo un'asta locale con un solo giocatore
      this.currentAuction.set({
        id: newAuctionId,
        player_id: player.id,
        bid: player.crediti,
        winner_team_id: null,
        data_scadenza: new Date(new Date().getTime() + 30000).toISOString()
      });
      this.selectedPlayer.set(player);
      this.startPolling();
      this.messageService.add({ severity: 'success', summary: 'Asta avviata', detail: `Asta per ${player.nome} avviata!` });
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Errore', detail: 'Impossibile avviare l\'asta.' });
    }
  }

  // Gestisce le offerte
  async placeBid(): Promise<void> {
    const auction = this.currentAuction();
    const bid = this.bidInput();

    if (!auction || !this.selectedPlayer()) {
      this.messageService.add({ severity: 'warn', summary: 'Attenzione', detail: 'Seleziona un giocatore in asta per fare un\'offerta.' });
      return;
    }

    try {
      await this.apiService.placeBid(auction.id, this.selectedPlayer()!.id, bid);
      this.messageService.add({ severity: 'success', summary: 'Offerta piazzata', detail: `Offerta di ${bid} crediti piazzata!` });
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Errore Offerta', detail: error.message || 'Errore nel piazzare l\'offerta.' });
    }
  }

  // Chiude l'asta
  private endAuction(): void {
    clearInterval(this.intervalId);
    this.currentAuction.set(null);
    this.selectedPlayer.set(null);
    this.timeLeft.set(0);
  }

  // Avvia il polling dello stato dell'asta
  private startPolling(): void {
    clearInterval(this.intervalId);
    this.intervalId = setInterval(async () => {
      const auction = this.currentAuction();
      if (!auction) {
        this.endAuction();
        return;
      }

      const timeRemaining = new Date(auction.data_scadenza).getTime() - new Date().getTime();
      this.timeLeft.set(Math.max(0, Math.floor(timeRemaining / 1000)));

      if (timeRemaining <= 0) {
        try {
          const status = await this.apiService.checkAuctionStatus(auction.id);
          this.messageService.add({ severity: 'info', summary: 'Asta Conclusa', detail: JSON.stringify(status) });
          this.endAuction();
        } catch (error) {
          console.error("Errore nel controllo dello stato dell'asta", error);
          this.endAuction();
        }
      }
    }, 1000);
  }

  getPlayersByRole(role: string, team: any): any[] {
    return team.players.filter((player: any) => player.ruolo === role);
  }

  getWinnerName(): string {
    // Implementa la logica per trovare il nome del vincitore
    return 'Nessuno';
  }
}