import type { Response } from "express";

export type EligibilityEventAction = "submission_created" | "submission_resubmitted" | "approved" | "rejected";

export type EligibilityEvent = {
  action: EligibilityEventAction;
  organizationId: number;
  learnerAccountId: number;
  submissionId?: number;
};

type Client = {
  id: number;
  res: Response;
};

let nextClientId = 1;
const byOrganizationId = new Map<number, Client[]>();
const byLearnerAccountId = new Map<number, Client[]>();

function sseWrite(res: Response, payload: string) {
  res.write(payload);
}

function pushClient(map: Map<number, Client[]>, key: number, client: Client) {
  const arr = map.get(key);
  if (arr) arr.push(client);
  else map.set(key, [client]);
}

function removeClient(map: Map<number, Client[]>, key: number, clientId: number) {
  const arr = map.get(key);
  if (!arr) return;
  const i = arr.findIndex((c) => c.id === clientId);
  if (i >= 0) arr.splice(i, 1);
  if (arr.length === 0) map.delete(key);
}

export function addEmployerEligibilitySseClient(res: Response, organizationId: number): () => void {
  const clientId = nextClientId++;
  const client: Client = { id: clientId, res };
  pushClient(byOrganizationId, organizationId, client);
  sseWrite(res, `: connected\n\n`);
  return () => removeClient(byOrganizationId, organizationId, clientId);
}

export function addLearnerEligibilitySseClient(res: Response, learnerAccountId: number): () => void {
  const clientId = nextClientId++;
  const client: Client = { id: clientId, res };
  pushClient(byLearnerAccountId, learnerAccountId, client);
  sseWrite(res, `: connected\n\n`);
  return () => removeClient(byLearnerAccountId, learnerAccountId, clientId);
}

function notifyClients(clients: Client[] | undefined, msg: string) {
  if (!clients?.length) return;
  for (const c of clients) {
    try {
      sseWrite(c.res, msg);
    } catch {
      // best-effort
    }
  }
}

export function publishEligibilityEvent(evt: EligibilityEvent) {
  const data = JSON.stringify(evt);
  const msg = `event: eligibility_changed\ndata: ${data}\n\n`;
  notifyClients(byOrganizationId.get(evt.organizationId), msg);
  notifyClients(byLearnerAccountId.get(evt.learnerAccountId), msg);
}

export function publishEligibilityPing() {
  const msg = `: ping\n\n`;
  for (const clients of byOrganizationId.values()) notifyClients(clients, msg);
  for (const clients of byLearnerAccountId.values()) notifyClients(clients, msg);
}
