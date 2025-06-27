export interface Thread {
    id?: number;
    title: string;
    author?: { id: number, nom?: string };
    postIds?: number[];
  }
  