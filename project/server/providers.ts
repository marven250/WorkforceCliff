import { db } from './db-setup';

export interface Provider {
  id: number;
  name: string;
  is_elligible: boolean;
}

export const getAllProviders = async (): Promise<Provider[]> => {
  const result = await db.all<Provider[]>('SELECT * FROM provider');
  return result;
}
