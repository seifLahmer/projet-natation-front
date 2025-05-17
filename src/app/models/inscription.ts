import { User } from './user';  
import { Competition } from './competition';

export enum StatutInscription {
  EN_ATTENTE = 'EN_ATTENTE',
  CONFIRMEE = 'CONFIRMEE',
  REJETEE = 'REJETEE'
}

export class Inscription {
  idInscription!: number;
  user!: User;
  competition!: Competition;
  dateInscription!: Date;
  statut!: StatutInscription;

  constructor() {
    this.idInscription = 0;
    this.user = new User();
    this.competition = new Competition();
    this.dateInscription = new Date();
    this.statut = StatutInscription.EN_ATTENTE;
  }
}
