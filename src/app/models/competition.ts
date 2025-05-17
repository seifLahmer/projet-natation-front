import { Resultat } from './resultat';
import { Piscine } from './piscine';
import { Inscription } from './inscription';
import { typeCompetition } from './typeCompetition';

export enum TypeCompetition {
 NL_50M_DAMES = "50 m NAGE LIBRE DAMES",
  NL_50M_MESSIEURS = "50 m NAGE LIBRE MESSIEURS",
  NL_100M_DAMES = "100 m NAGE LIBRE DAMES",
  NL_100M_MESSIEURS = "100 m NAGE LIBRE MESSIEURS",
  NL_200M_DAMES = "200 m NAGE LIBRE DAMES",
  NL_200M_MESSIEURS = "200 m NAGE LIBRE MESSIEURS",
  NL_400M_DAMES = "400 m NAGE LIBRE DAMES",
  NL_400M_MESSIEURS = "400 m NAGE LIBRE MESSIEURS",
  NL_800M_DAMES = "800 m NAGE LIBRE DAMES",
  NL_800M_MESSIEURS = "800 m NAGE LIBRE MESSIEURS",
  NL_1500M_DAMES = "1500 m NAGE LIBRE DAMES",
  NL_1500M_MESSIEURS = "1500 m NAGE LIBRE MESSIEURS",
  RELAIS_NL_4X50M_MIXTE = "4 x 50 m NAGE LIBRE MIXTE",
  RELAIS_NL_4X100M_DAMES = "4 x 100 m NAGE LIBRE DAMES",
  RELAIS_NL_4X100M_MESSIEURS = "4 x 100 m NAGE LIBRE MESSIEURS",
  RELAIS_NL_4X200M_DAMES = "4 x 200 m NAGE LIBRE DAMES",
  RELAIS_NL_4X200M_MESSIEURS = "4 x 200 m NAGE LIBRE MESSIEURS",

  // DOS
  DOS_50M_DAMES = "50 m DOS DAMES",
  DOS_50M_MESSIEURS = "50 m DOS MESSIEURS",
  DOS_100M_DAMES = "100 m DOS DAMES",
  DOS_100M_MESSIEURS = "100 m DOS MESSIEURS",
  DOS_200M_DAMES = "200 m DOS DAMES",
  DOS_200M_MESSIEURS = "200 m DOS MESSIEURS",

  // BRASSE
  BRASSE_50M_DAMES = "50 m BRASSE DAMES",
  BRASSE_50M_MESSIEURS = "50 m BRASSE MESSIEURS",
  BRASSE_100M_DAMES = "100 m BRASSE DAMES",
  BRASSE_100M_MESSIEURS = "100 m BRASSE MESSIEURS",
  BRASSE_200M_DAMES = "200 m BRASSE DAMES",
  BRASSE_200M_MESSIEURS = "200 m BRASSE MESSIEURS",

  // PAPILLON
  PAPILLON_50M_DAMES = "50 m PAPILLON DAMES",
  PAPILLON_50M_MESSIEURS = "50 m PAPILLON MESSIEURS",
  PAPILLON_100M_DAMES = "100 m PAPILLON DAMES",
  PAPILLON_100M_MESSIEURS = "100 m PAPILLON MESSIEURS",
  PAPILLON_200M_DAMES = "200 m PAPILLON DAMES",
  PAPILLON_200M_MESSIEURS = "200 m PAPILLON MESSIEURS",

  // 4 NAGES
  QN_100M_DAMES = "100 m 4 NAGES DAMES",
  QN_100M_MESSIEURS = "100 m 4 NAGES MESSIEURS",
  QN_200M_DAMES = "200 m 4 NAGES DAMES",
  QN_200M_MESSIEURS = "200 m 4 NAGES MESSIEURS",
  QN_400M_DAMES = "400 m 4 NAGES DAMES",
  QN_400M_MESSIEURS = "400 m 4 NAGES MESSIEURS",
  RELAIS_QN_4X50M_MIXTE = "4 x 50 m 4 NAGES MIXTE",
  RELAIS_QN_4X100M_DAMES = "4 x 100 m 4 NAGES DAMES",
  RELAIS_QN_4X100M_MESSIEURS = "4 x 100 m 4 NAGES MESSIEURS"
}


export class Competition {
  idReservation: number;
  typeC: TypeCompetition; 
  dateDebut: Date;
  dateFin: Date;
  nbrParticipants: number;
  heure: string; // LocalTime is represented as string in TypeScript
  resultats?: Resultat[];
  piscine?: Piscine;

  inscriptions?: Inscription[]; // List of inscriptions for the competition
 // Indicates if the competition is open for registration
  constructor() {
    this.idReservation = 0;
    this.typeC = TypeCompetition.NL_50M_DAMES; // Initialize with a default value
    this.nbrParticipants = 0;
    this.dateDebut = new Date();
    this.dateFin = new Date();
    this.heure = '';
    
  }
}