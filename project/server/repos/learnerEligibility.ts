import { db } from "../db-setup";

export type EligibilityStatus = "pending" | "eligible" | "ineligible";

export interface PendingEligibilityRow {
  id: number;
  provider_id: number;
  provider_name: string;
  learner_account_id: number;
  learner_email: string;
  learner_first_name: string;
  learner_last_name: string;
  created_at: string;
}

export async function listPendingForOrganization(organizationId: number): Promise<PendingEligibilityRow[]> {
  const rows = (await db.all(
    `SELECT les.id, les.provider_id, p.name AS provider_name, les.learner_account_id,
            a.email AS learner_email, a.first_name AS learner_first_name, a.last_name AS learner_last_name,
            les.created_at
     FROM learner_eligibility_submissions les
     JOIN auth_accounts a ON a.id = les.learner_account_id
     JOIN providers p ON p.id = les.provider_id
     WHERE les.status = 'pending' AND a.organization_id = ?
     ORDER BY les.id ASC`,
    organizationId,
  )) as PendingEligibilityRow[];
  return rows;
}

export type DecisionResult = "ok" | "not_found" | "wrong_organization" | "not_pending";

export async function setEligibilityDecision(
  submissionId: number,
  employerOrganizationId: number,
  decision: "approve" | "reject",
): Promise<DecisionResult> {
  const row = await db.get<{ status: string; learner_org_id: number | null }>(
    `SELECT les.status, learner.organization_id AS learner_org_id
     FROM learner_eligibility_submissions les
     JOIN auth_accounts learner ON learner.id = les.learner_account_id
     WHERE les.id = ?`,
    submissionId,
  );
  if (!row) return "not_found";
  if (row.learner_org_id !== employerOrganizationId) return "wrong_organization";
  if (row.status !== "pending") return "not_pending";
  const next: EligibilityStatus = decision === "approve" ? "eligible" : "ineligible";
  const r = await db.run(
    `UPDATE learner_eligibility_submissions
     SET status = ?, decided_at = datetime('now')
     WHERE id = ?
       AND status = 'pending'
       AND (SELECT organization_id FROM auth_accounts WHERE id = learner_eligibility_submissions.learner_account_id) = ?`,
    next,
    submissionId,
    employerOrganizationId,
  );
  return (r.changes ?? 0) > 0 ? "ok" : "not_pending";
}

export type RequestOutcome = "created" | "already_pending" | "already_eligible" | "resubmitted";

export async function requestEligibilityForProvider(
  learnerAccountId: number,
  providerId: number,
): Promise<RequestOutcome> {
  const existing = await db.get<{ status: string }>(
    `SELECT status FROM learner_eligibility_submissions WHERE learner_account_id = ? AND provider_id = ?`,
    learnerAccountId,
    providerId,
  );
  if (!existing) {
    await db.run(
      `INSERT INTO learner_eligibility_submissions (learner_account_id, provider_id, status)
       VALUES (?, ?, 'pending')`,
      learnerAccountId,
      providerId,
    );
    return "created";
  }
  if (existing.status === "pending") return "already_pending";
  if (existing.status === "eligible") return "already_eligible";
  await db.run(
    `UPDATE learner_eligibility_submissions
     SET status = 'pending', decided_at = NULL, created_at = datetime('now')
     WHERE learner_account_id = ? AND provider_id = ?`,
    learnerAccountId,
    providerId,
  );
  return "resubmitted";
}
