export interface Player {
  id: string;
  nome: string;
  squadra: string;
  ruolo: string;
  crediti: number;
  status: 'available' | 'in-auction' | 'sold';
}
export interface FantasyTeam {
  id: string;
  name: string;
  credits: number;
  players: Player[];
}

export interface Auction {
  id: string;
  player_id: string;
  bid: number;
  winner_team_id: string | null;
  data_scadenza: string;
}

export interface AuctionHistoryItem {
  playerId: string;
  bid: number;
  winnerTeamId: string;
}
