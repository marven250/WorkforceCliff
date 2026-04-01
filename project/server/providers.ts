import { db } from './db-setup';
import {Provider} from "../shared/Provider"

export const getAllProviders = async (): Promise<Provider[]> => {
  const result = await db.all<Provider[]>('SELECT * FROM provider');
  return result;
}
