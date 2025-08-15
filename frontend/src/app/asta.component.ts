import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { MessageModule } from 'primeng/message'; // Aggiunto per il messaggio
import { MessageService } from 'primeng/api'; // Aggiunto per il servizio di messaggi
import { ToastModule } from 'primeng/toast'; // Aggiunto per i messaggi

import { Player, FantasyTeam, Auction, AuctionHistoryItem } from './shared/interfaces';
import { mockTeams, mockPlayers, emptyFantasyTeam } from './shared/mock-data';

@Component({
  selector: 'app-asta',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, InputTextModule, ButtonModule, PanelModule, MessageModule, FormsModule, ToastModule],
  templateUrl: './asta.component.html',
  providers: [MessageService] // Aggiunto il servizio come provider
})
export class AstaComponent implements OnInit {

  // Servizio per i messaggi iniettato
  private messageService = inject(MessageService);

  // Stati dell'applicazione usando i signal
  teams = signal<FantasyTeam[]>(mockTeams);
  players = signal<Player[]>(mockPlayers);
  selectedPlayer = signal<Player | null>(null);
  currentTeamId = signal<number | null>(null);
  currentAuction = signal<Auction | null>(null);
  auctionHistory = signal<AuctionHistoryItem[]>([]);

  // Stato per la ricerca e il filtro
  searchTerm = '';
  selectedRole = signal<'P' | 'D' | 'C' | 'A' | null>(null);
  timeLeft = signal<number>(20);
  roles = ['P', 'D', 'C', 'A'] as const;
  private intervalId: any;

  ngOnInit(): void {
    // Inizializza l'intervallo del timer se necessario
    this.startTimer();
  }

  // Metodo per filtrare i giocatori in base alla ricerca e al ruolo
  filteredPlayers = () => {
    return this.players().filter(player => {
      const roleMatch = this.selectedRole() ? player.role === this.selectedRole() : true;
      const searchMatch = player.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      return roleMatch && searchMatch;
    });
  }

  getPlayerInitials(player: Player): string {
    if (!player || !player.name) {
      return '';
    }
    return player.name.split(' ').map(n => n[0]).join('');
  }

  // Metodo per ottenere il nome del vincitore dell'asta
  getWinnerName(): string {
    const winnerId = this.currentAuction()?.winnerId;
    if (winnerId) {
      const winnerTeam = this.teams().find(t => t.id === winnerId);
      return winnerTeam ? winnerTeam.name : 'Nessuno';
    }
    return 'Nessuno';
  }

  setSelectedRole(role: 'P' | 'D' | 'C' | 'A' | null) {
    this.selectedRole.set(this.selectedRole() === role ? null : role);
  }

  // Seleziona un giocatore dal listone
  onSelectPlayer(player: Player): void {
    this.selectedPlayer.set(player);
  }

  // Seleziona la squadra corrente
  onTeamSelect(teamId: number): void {
    this.currentTeamId.set(teamId);
  }

  // Avvia l'asta per un giocatore
  startAuction(player: Player): void {
    if (this.currentAuction()) {
      this.messageService.add({ severity: 'error', summary: 'Errore', detail: 'Un\'asta è già in corso!' });
      return;
    }
    const newAuction: Auction = {
      id: this.generateId(),
      player,
      bid: player.value,
      winnerId: null,
      startTime: Date.now(),
    };
    this.currentAuction.set(newAuction);
    this.selectedPlayer.set(player);
    this.players.update(prevPlayers => prevPlayers.map(p => p.id === player.id ? { ...p, status: 'in-auction' } : p));
    this.startTimer();
    this.messageService.add({ severity: 'success', summary: 'Asta avviata', detail: `Asta per ${player.name} avviata!` });
  }

  // Gestisce le offerte
  placeBid(newBid: number): void {
    const auction = this.currentAuction();
    const teamId = this.currentTeamId();
    if (!auction || !teamId) {
      this.messageService.add({ severity: 'warn', summary: 'Attenzione', detail: 'Seleziona una squadra e un giocatore in asta per fare un\'offerta.' });
      return;
    }

    const currentWinner = this.teams().find(t => t.id === auction.winnerId);
    if (currentWinner && currentWinner.id === teamId) {
      this.messageService.add({ severity: 'info', summary: 'Già vincitore', detail: 'Sei già il vincitore dell\'asta!' });
      return;
    }

    const currentTeam = this.teams().find(t => t.id === teamId);
    if (currentTeam && currentTeam.credits < newBid) {
      this.messageService.add({ severity: 'error', summary: 'Crediti insufficienti', detail: `Non hai abbastanza crediti per fare un'offerta di ${newBid}.` });
      return;
    }

    this.teams.update(prevTeams => prevTeams.map(t => t.id === teamId ? { ...t, credits: t.credits - (newBid - auction.bid) } : t));

    this.currentAuction.update(prevAuction => ({
      ...prevAuction!,
      bid: newBid,
      winnerId: teamId,
      startTime: Date.now(),
    }));
    this.startTimer(); // Reset del timer
  }

  // Chiude l'asta
  endAuction(): void {
    const auction = this.currentAuction();
    if (!auction) {
      return;
    }

    clearInterval(this.intervalId);
    const winner = this.teams().find(t => t.id === auction.winnerId);

    let historyStatus = 'invenduto';
    if (winner) {
      historyStatus = 'vinto';
      this.players.update(prevPlayers => prevPlayers.map(p => p.id === auction.player.id ? { ...p, status: 'acquired', fantasyTeamId: winner.id } : p));
      this.teams.update(prevTeams => prevTeams.map(t => t.id === winner.id ? { ...t, players: [...t.players, auction.player] } : t));
    } else {
      this.players.update(prevPlayers => prevPlayers.map(p => p.id === auction.player.id ? { ...p, status: 'available' } : p));
    }

    const historyWinner = winner ? winner : emptyFantasyTeam;
    this.auctionHistory.update(prevHistory => [{ player: auction.player, bid: auction.bid, winner: historyWinner, status: historyStatus }, ...prevHistory]);

    this.currentAuction.set(null);
    this.selectedPlayer.set(null);
    this.timeLeft.set(20);

    this.messageService.add({ severity: 'info', summary: 'Asta Conclusa', detail: winner ? `${winner.name} ha acquistato ${auction.player.name} per ${auction.bid} crediti!` : `Asta per ${auction.player.name} terminata senza vincitori.` });
  }

  get selectedTeamPlayers(): Player[] {
    const team = this.teams().find(t => t.id === this.currentTeamId());
    return team ? team.players : [];
  }

  // Avvia il timer dell'asta
  private startTimer(): void {
    clearInterval(this.intervalId);
    this.timeLeft.set(20);
    this.intervalId = setInterval(() => {
      this.timeLeft.update(val => {
        if (val > 1) {
          return val - 1;
        } else {
          this.endAuction();
          return 0;
        }
      });
    }, 1000);
  }

  // Helper per generare ID unico
  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  getPlayerCardBg(player: Player): string {
    if (this.currentAuction() && this.currentAuction()?.player.id === player.id) {
      return this.currentAuction()?.winnerId === this.currentTeamId() ? 'rgba(34, 197, 94, 0.5)' : 'rgba(234, 179, 8, 0.5)';
    }
    return 'rgba(75, 85, 99, 0.7)';
  }

  getPlayerCardBorder(player: Player): string {
    if (this.currentAuction() && this.currentAuction()?.player.id === player.id) {
      return this.currentAuction()?.winnerId === this.currentTeamId() ? 'rgba(34, 197, 94, 1)' : 'rgba(234, 179, 8, 1)';
    }
    return 'transparent';
  }
}
