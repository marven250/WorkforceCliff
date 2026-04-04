import { db } from "./db-setup";
import { Provider } from "../shared/Provider";

export const getAllProviders = async (user_id: string): Promise<Provider[]> => {
  const result = await db.all<Provider[]>(
    `SELECT p.id, p.name, pi.integration_type, pi.is_enabled, pi.redirect_url, es.status FROM providers p LEFT JOIN provider_integrations pi ON p.id = pi.provider_id LEFT JOIN eligibility_submissions es ON es.provider_id = p.id AND es.user_id = ${user_id}`,
  );
  return result;
};
