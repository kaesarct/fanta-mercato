// src/app/shared/data/mock-data.ts
import { FantasyTeam, Player } from './interfaces'; // Assicurati di avere le interfacce in un file separato!

export const mockTeams: FantasyTeam[] = [
  { id: 1, name: 'Paolo', credits: 500, maxCredits: { P: 100, D: 125, C: 125, A: 150 }, players: [] },
  { id: 2, name: 'Giacomo', credits: 500, maxCredits: { P: 100, D: 125, C: 125, A: 150 }, players: [] },
  { id: 3, name: 'Rietta', credits: 500, maxCredits: { P: 100, D: 125, C: 125, A: 150 }, players: [] },
  { id: 4, name: 'Simone', credits: 495, maxCredits: { P: 100, D: 125, C: 125, A: 150 }, players: [] },
  { id: 5, name: 'Dibba', credits: 495, maxCredits: { P: 100, D: 125, C: 125, A: 150 }, players: [] },
  { id: 6, name: 'Leone', credits: 495, maxCredits: { P: 100, D: 125, C: 125, A: 150 }, players: [] },
  { id: 7, name: 'Andrea', credits: 500, maxCredits: { P: 100, D: 125, C: 125, A: 150 }, players: [] },
  { id: 8, name: 'Giuseppe', credits: 500, maxCredits: { P: 100, D: 125, C: 125, A: 150 }, players: [] },
];

export const mockPlayers: Player[] = [
  { id: 1, name: 'Cristiano Ronaldo', team: 'Al-Nassr', role: 'A', value: 100, status: 'available', fantasyTeamId: null },
  { id: 2, name: 'Lionel Messi', team: 'Inter Miami', role: 'A', value: 95, status: 'available', fantasyTeamId: null },
  { id: 3, name: 'Kylian Mbappé', team: 'PSG', role: 'A', value: 110, status: 'available', fantasyTeamId: null },
  { id: 4, name: 'Erling Haaland', team: 'Man City', role: 'A', value: 120, status: 'available', fantasyTeamId: null },
  { id: 5, name: 'Victor Osimhen', team: 'Napoli', role: 'A', value: 90, status: 'available', fantasyTeamId: null },
  { id: 6, name: 'Harry Kane', team: 'Bayern', role: 'A', value: 85, status: 'available', fantasyTeamId: null },
  { id: 7, name: 'Lautaro Martinez', team: 'Inter', role: 'A', value: 80, status: 'available', fantasyTeamId: null },
  { id: 8, name: 'Rafael Leão', team: 'Milan', role: 'A', value: 75, status: 'available', fantasyTeamId: null },
  { id: 9, name: 'Federico Chiesa', team: 'Juventus', role: 'A', value: 70, status: 'available', fantasyTeamId: null },
  { id: 10, name: 'Romelu Lukaku', team: 'Roma', role: 'A', value: 65, status: 'available', fantasyTeamId: null },
  { id: 11, name: 'Mike Maignan', team: 'Milan', role: 'P', value: 25, status: 'available', fantasyTeamId: null },
  { id: 12, name: 'Alex Meret', team: 'Napoli', role: 'P', value: 20, status: 'available', fantasyTeamId: null },
  { id: 13, name: 'Samir Handanovic', team: 'Inter', role: 'P', value: 15, status: 'available', fantasyTeamId: null },
  { id: 14, name: 'Wojciech Szczęsny', team: 'Juventus', role: 'P', value: 30, status: 'available', fantasyTeamId: null },
  { id: 15, name: 'Danilo', team: 'Juventus', role: 'D', value: 35, status: 'available', fantasyTeamId: null },
  { id: 16, name: 'Theo Hernández', team: 'Milan', role: 'D', value: 50, status: 'available', fantasyTeamId: null },
  { id: 17, name: 'Giovanni Di Lorenzo', team: 'Napoli', role: 'D', value: 45, status: 'available', fantasyTeamId: null },
  { id: 18, name: 'Alessandro Bastoni', team: 'Inter', role: 'D', value: 40, status: 'available', fantasyTeamId: null },
  { id: 19, name: 'Niccolò Barella', team: 'Inter', role: 'C', value: 60, status: 'available', fantasyTeamId: null },
  { id: 20, name: 'Sandro Tonali', team: 'Newcastle', role: 'C', value: 55, status: 'available', fantasyTeamId: null },
];

export const emptyFantasyTeam: FantasyTeam = {
  id: 0,
  name: 'Nessuno',
  credits: 0,
  maxCredits: { P: 0, D: 0, C: 0, A: 0 },
  players: []
};