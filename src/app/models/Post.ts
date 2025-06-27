


export interface Post {
    id?: number;
    content: string;
    threadId?: number;
    createdAt?: string;
    author?: { id: number, nom?: string };
    comments?: Comment[];
  }
  
  