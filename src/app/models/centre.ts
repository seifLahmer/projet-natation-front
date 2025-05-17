// models/centre.ts
import { Piscine } from './piscine';

export class Centre {
  idCentre: number;
  nomCentre: string;
  localisation: string;
  piscines?: Piscine[];
  
  constructor() {
    this.idCentre = 0;
    this.nomCentre = '';
    this.localisation = '';
  }
}