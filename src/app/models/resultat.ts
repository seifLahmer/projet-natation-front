// models/resultat.model.ts
import { User } from './user';
import { Competition } from './competition';

export interface Resultat {
    idResultat?: number;         // correspond à l'ID généré automatiquement
    place: number;               // correspond au rang du participant
    temps: string;               // ex : "00:58.45"
    points: number;
    tempsDePassage: string;      // doit être au format "HH:mm:ss" ou "HH:mm:ss.SSS"
    utilisateurs: User;          // correspond exactement à l'entité `Utilisateurs` côté Java
    competition: Competition;
  }