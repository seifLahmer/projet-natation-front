// models/resultat.model.ts
import { User } from './user';
import { Competition } from './competition';

export interface Resultat {
    place: number;
    temps: string;
    points: number;
    tempsDePassage: string;
    user: User;
    competition: Competition;
}