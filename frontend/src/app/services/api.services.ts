import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Player, FantasyTeam } from '../shared/interfaces';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = `${environment.backendUrl}/api`; // Sostituisci con l'URL del tuo backend
  private auth_token = 'simulated-token'; // Token simulato
  private http = inject(HttpClient);

  private getHeaders(): HttpHeaders {
    return new HttpHeaders().set('Authorization', `Bearer ${this.auth_token}`);
  }

  async createAuction(leagueId: string): Promise<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/leagues/${leagueId}/auctions`, null, { headers }).toPromise();
  }

  async placeBid(auctionId: string, playerId: string, offerta: number): Promise<any> {
    const headers = this.getHeaders();
    const bidPayload = { offerta };
    return this.http.post(`${this.apiUrl}/auctions/${auctionId}/bid?giocatore_id=${playerId}`, bidPayload, { headers }).toPromise();
  }

  async checkAuctionStatus(auctionId: string): Promise<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/auctions/${auctionId}/check_status`, { headers }).toPromise();
  }

  async getMyTeamDetails(auctionId: string): Promise<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/auctions/${auctionId}/my_team`, { headers }).toPromise();
  }

  async getPlayers(leagueId: string): Promise<any> {
    const headers = this.getHeaders();
    return this.http.get<Player[]>(`${this.apiUrl}/leagues/${leagueId}/players`, { headers }).toPromise();
  }
  async getLeagueId(leagueId: string): Promise<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/leagues/${leagueId}`, { headers }).toPromise();
  }
  async getLeagueIdByUsername(): Promise<any> {
    const headers = this.getHeaders();
    // Assuming the /api/auth/me endpoint returns an object with a 'leagueId' property
    return this.http.get<{ leagueId: string }>(`${this.apiUrl}/auth/me`, { headers }).toPromise().then(response => {
      return response ? response.leagueId : null;
    });
  }
}
