import { db } from "./db-setup";
import { Provider } from "../shared/Provider";

/** Eligibility rows keyed by `auth_accounts` learner id (Workforce Cliff sign-in). */
export async function getProvidersForAuthLearner(learnerAccountId: number): Promise<Provider[]> {
  const result = await db.all<Provider[]>(
    `SELECT p.id, p.name, pi.integration_type, pi.is_enabled, pi.redirect_url, les.status
     FROM providers p
     LEFT JOIN provider_integrations pi ON p.id = pi.provider_id
     LEFT JOIN learner_eligibility_submissions les
       ON les.provider_id = p.id AND les.learner_account_id = ?`,
    learnerAccountId,
  );
  return result;
}
