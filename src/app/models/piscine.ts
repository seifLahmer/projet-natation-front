// models/piscine.model.ts
import { Competition } from "./competition";
import { Centre } from "./centre";
export class Piscine {
  idPiscine: number;
  nomPiscine: string;
 
  nbreRows: number;
  competitions?: Competition[];
  centre?: Centre; // Ajout de la propriété Centre
  
  constructor() {
    this.idPiscine = 0;
    this.nomPiscine = '';
    
    this.nbreRows = 0;
  }
}