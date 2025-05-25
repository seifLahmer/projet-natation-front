// models/user.model.ts
import { Inscription } from './inscription';
import { Resultat } from './resultat';

export class User {
  id?: number;
  nom: string;
  prenom: string;
  naissance: Date;
  nation: string;
  email: string;
  password: string;
  telephone: string;
  document_path: string;
  active: boolean;
  date_creation: Date;
  role?: string;
  club_id: number;
  nomClub: string;
  adresseClub: string;
  inscriptions?: Inscription[];
  resultats?: Resultat[];

  constructor() {
    this.id = 0;
    this.nom = '';
    this.prenom = '';
    this.naissance = new Date();
    this.nation = '';
    this.email = '';
    this.password = '';
    this.telephone = '';
    this.document_path = '';
    this.active = false;
    this.date_creation = new Date();
    this.role = '';
    this.club_id = 0;
    this.nomClub = '';
    this.adresseClub = '';
  }
}