// src/app/shared/interfaces/interfaces.ts

export interface Player {
  id: number;
  name: string;
  team: string;
  role: 'P' | 'D' | 'C' | 'A';
  value: number;
  status: 'available' | 'in-auction' | 'acquired';
  fantasyTeamId: number | null;
}

export interface FantasyTeam {
  id: number;
  name: string;
  credits: number;
  maxCredits: { P: number; D: number; C: number; A: number };
  players: Player[];
}

export interface Auction {
  id: string;
  player: Player;
  bid: number;
  winnerId: number | null;
  startTime: number;
}

export interface AuctionHistoryItem {
  player: Player;
  bid: number;
  winner: FantasyTeam;
  status: string;
}